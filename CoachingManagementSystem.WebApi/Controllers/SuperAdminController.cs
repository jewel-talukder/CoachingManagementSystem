using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Super Admin")]
public class SuperAdminController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SuperAdminController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboard()
    {
        var totalCoachings = await _context.Coachings.CountAsync(c => !c.IsDeleted);
        var activeCoachings = await _context.Coachings.CountAsync(c => c.IsActive && !c.IsBlocked && !c.IsDeleted);
        var blockedCoachings = await _context.Coachings.CountAsync(c => c.IsBlocked && !c.IsDeleted);
        var totalUsers = await _context.Users.CountAsync(u => !u.IsDeleted);
        var totalStudents = await _context.Students.CountAsync(s => !s.IsDeleted);
        var totalTeachers = await _context.Teachers.CountAsync(t => !t.IsDeleted);

        var coachingsWithSubscriptions = await _context.Coachings
            .Include(c => c.Subscription)
                .ThenInclude(s => s.Plan)
            .Where(c => !c.IsDeleted)
            .Select(c => new
            {
                Id = c.Id,
                Name = c.Name,
                IsActive = c.IsActive,
                IsBlocked = c.IsBlocked,
                SubscriptionStatus = c.Subscription != null ? c.Subscription.Status : "No Subscription",
                PlanName = c.Subscription != null ? c.Subscription.Plan.Name : null,
                SubscriptionExpiresAt = c.SubscriptionExpiresAt
            })
            .ToListAsync();

        return Ok(new
        {
            Summary = new
            {
                TotalCoachings = totalCoachings,
                ActiveCoachings = activeCoachings,
                BlockedCoachings = blockedCoachings,
                TotalUsers = totalUsers,
                TotalStudents = totalStudents,
                TotalTeachers = totalTeachers
            },
            Coachings = coachingsWithSubscriptions
        });
    }

    [HttpGet("coachings")]
    public async Task<ActionResult> GetAllCoachings([FromQuery] bool? isActive, [FromQuery] bool? isBlocked)
    {
        var query = _context.Coachings
            .Include(c => c.Subscription)
                .ThenInclude(s => s.Plan)
            .Where(c => !c.IsDeleted);

        if (isActive.HasValue)
            query = query.Where(c => c.IsActive == isActive.Value);

        if (isBlocked.HasValue)
            query = query.Where(c => c.IsBlocked == isBlocked.Value);

        var coachings = await query
            .Select(c => new
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                Phone = c.Phone,
                City = c.City,
                State = c.State,
                IsActive = c.IsActive,
                IsBlocked = c.IsBlocked,
                SubscriptionStatus = c.Subscription != null ? c.Subscription.Status : "No Subscription",
                PlanName = c.Subscription != null ? c.Subscription.Plan.Name : null,
                SubscriptionExpiresAt = c.SubscriptionExpiresAt,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(coachings);
    }

    [HttpPut("coachings/{id}/activate")]
    public async Task<ActionResult> ActivateCoaching(int id)
    {
        var coaching = await _context.Coachings
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (coaching == null)
            return NotFound(new { message = "Coaching not found" });

        coaching.IsActive = true;
        coaching.IsBlocked = false;
        coaching.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Coaching activated successfully" });
    }

    [HttpPut("coachings/{id}/block")]
    public async Task<ActionResult> BlockCoaching(int id)
    {
        var coaching = await _context.Coachings
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (coaching == null)
            return NotFound(new { message = "Coaching not found" });

        coaching.IsBlocked = true;
        coaching.IsActive = false;
        coaching.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Coaching blocked successfully" });
    }

    [HttpPut("coachings/{id}/assign-plan")]
    public async Task<ActionResult> AssignPlan(int id, [FromBody] AssignPlanRequest request)
    {
        var coaching = await _context.Coachings
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (coaching == null)
            return NotFound(new { message = "Coaching not found" });

        var plan = await _context.Plans
            .FirstOrDefaultAsync(p => p.Id == request.PlanId && p.IsActive && !p.IsDeleted);

        if (plan == null)
            return NotFound(new { message = "Plan not found" });

        // Create or update subscription
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.CoachingId == id && s.Status == "Active");

        var startDate = DateTime.UtcNow;
        var endDate = plan.BillingPeriod == "Monthly" 
            ? startDate.AddMonths(1) 
            : startDate.AddYears(1);

        if (subscription == null)
        {
            subscription = new Subscription
            {
                CoachingId = id,
                PlanId = plan.Id,
                StartDate = startDate,
                EndDate = endDate,
                Status = "Active",
                Amount = plan.Price,
                AutoRenew = request.AutoRenew
            };
            _context.Subscriptions.Add(subscription);
        }
        else
        {
            subscription.PlanId = plan.Id;
            subscription.StartDate = startDate;
            subscription.EndDate = endDate;
            subscription.Amount = plan.Price;
            subscription.AutoRenew = request.AutoRenew;
            subscription.UpdatedAt = DateTime.UtcNow;
        }

        coaching.PlanId = plan.Id;
        coaching.SubscriptionId = subscription.Id;
        coaching.SubscriptionExpiresAt = endDate;
        coaching.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Plan assigned successfully" });
    }
}

public class AssignPlanRequest
{
    public int PlanId { get; set; }
    public bool AutoRenew { get; set; } = false;
}

