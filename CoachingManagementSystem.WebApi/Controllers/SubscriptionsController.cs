using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Application.Features.Subscriptions.DTOs;
using CoachingManagementSystem.Application.DTOs.Auth;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SubscriptionsController(IApplicationDbContext context)
    {
        _context = context;
    }

    private int? GetCoachingId()
    {
        var coachingIdClaim = User.FindFirst("coachingId");
        if (coachingIdClaim != null && int.TryParse(coachingIdClaim.Value, out var coachingId))
        {
            return coachingId;
        }
        return null;
    }

    [HttpGet("current")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<CurrentSubscriptionDto>> GetCurrentSubscription()
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var coaching = await _context.Coachings
            .Include(c => c.Subscription)
                .ThenInclude(s => s.Plan)
            .FirstOrDefaultAsync(c => c.Id == coachingId.Value && !c.IsDeleted);

        if (coaching == null)
            return NotFound(new { message = "Coaching not found" });

        if (coaching.Subscription == null || coaching.Subscription.Plan == null)
            return NotFound(new { message = "No active subscription found" });

        return Ok(new CurrentSubscriptionDto
        {
            SubscriptionId = coaching.Subscription.Id,
            Plan = new PlanDto
            {
                Id = coaching.Subscription.Plan.Id,
                Name = coaching.Subscription.Plan.Name,
                Description = coaching.Subscription.Plan.Description,
                Price = coaching.Subscription.Plan.Price,
                BillingPeriod = coaching.Subscription.Plan.BillingPeriod,
                TrialDays = coaching.Subscription.Plan.TrialDays,
                MaxUsers = coaching.Subscription.Plan.MaxUsers,
                MaxCourses = coaching.Subscription.Plan.MaxCourses,
                MaxStudents = coaching.Subscription.Plan.MaxStudents,
                MaxTeachers = coaching.Subscription.Plan.MaxTeachers
            },
            StartDate = coaching.Subscription.StartDate,
            EndDate = coaching.Subscription.EndDate,
            TrialEndDate = coaching.Subscription.TrialEndDate,
            Status = coaching.Subscription.Status,
            Amount = coaching.Subscription.Amount,
            AutoRenew = coaching.Subscription.AutoRenew,
            SubscriptionExpiresAt = coaching.SubscriptionExpiresAt
        });
    }

    [HttpGet("plans")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<IEnumerable<PlanDto>>> GetAvailablePlans([FromQuery] string? billingPeriod)
    {
        var plansQuery = _context.Plans
            .Where(p => p.IsActive && !p.IsDeleted);

        if (!string.IsNullOrEmpty(billingPeriod))
        {
            plansQuery = plansQuery.Where(p => p.BillingPeriod == billingPeriod);
        }

        var plans = await plansQuery
            .OrderBy(p => p.Price)
            .Select(p => new PlanDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                BillingPeriod = p.BillingPeriod,
                TrialDays = p.TrialDays,
                MaxUsers = p.MaxUsers,
                MaxCourses = p.MaxCourses,
                MaxStudents = p.MaxStudents,
                MaxTeachers = p.MaxTeachers
            })
            .ToListAsync();

        return Ok(plans);
    }

    [HttpPut("change-plan")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> ChangePlan([FromBody] ChangePlanRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var coaching = await _context.Coachings
            .Include(c => c.Subscription)
            .FirstOrDefaultAsync(c => c.Id == coachingId.Value && !c.IsDeleted);

        if (coaching == null)
            return NotFound(new { message = "Coaching not found" });

        var newPlan = await _context.Plans
            .FirstOrDefaultAsync(p => p.Id == request.PlanId && p.IsActive && !p.IsDeleted);

        if (newPlan == null)
            return NotFound(new { message = "Plan not found" });

        // Check if trying to change to the same plan
        if (coaching.PlanId == newPlan.Id)
            return BadRequest(new { message = "You are already on this plan" });

        var startDate = DateTime.UtcNow;
        DateTime endDate;
        
        // If current subscription is in trial, end trial immediately
        if (coaching.Subscription != null && coaching.Subscription.Status == "Trial")
        {
            // End trial and start new plan immediately
            endDate = newPlan.BillingPeriod == "Yearly" 
                ? startDate.AddYears(1) 
                : startDate.AddMonths(1);
        }
        else
        {
            // If subscription exists and not expired, extend from current end date
            if (coaching.Subscription != null && coaching.Subscription.EndDate > startDate)
            {
                var remainingDays = (coaching.Subscription.EndDate - startDate).Days;
                if (newPlan.BillingPeriod == "Yearly")
                {
                    endDate = startDate.AddYears(1).AddDays(remainingDays);
                }
                else
                {
                    endDate = startDate.AddMonths(1).AddDays(remainingDays);
                }
            }
            else
            {
                // New subscription
                endDate = newPlan.BillingPeriod == "Yearly" 
                    ? startDate.AddYears(1) 
                    : startDate.AddMonths(1);
            }
        }

        // Update or create subscription
        if (coaching.Subscription != null)
        {
            // Update existing subscription
            coaching.Subscription.PlanId = newPlan.Id;
            coaching.Subscription.StartDate = startDate;
            coaching.Subscription.EndDate = endDate;
            coaching.Subscription.TrialEndDate = null; // End trial if exists
            coaching.Subscription.Status = "Active";
            coaching.Subscription.Amount = newPlan.Price;
            coaching.Subscription.AutoRenew = request.AutoRenew;
            coaching.Subscription.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new subscription
            var subscription = new Subscription
            {
                CoachingId = coachingId.Value,
                PlanId = newPlan.Id,
                StartDate = startDate,
                EndDate = endDate,
                TrialEndDate = null,
                Status = "Active",
                Amount = newPlan.Price,
                AutoRenew = request.AutoRenew
            };
            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();
            coaching.SubscriptionId = subscription.Id;
        }

        // Update coaching
        coaching.PlanId = newPlan.Id;
        coaching.SubscriptionExpiresAt = endDate;
        coaching.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Plan changed successfully", newPlan = newPlan.Name });
    }
}

