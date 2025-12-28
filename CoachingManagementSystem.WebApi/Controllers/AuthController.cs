using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.DTOs.Auth;
using CoachingManagementSystem.Application.Interfaces;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IApplicationDbContext _context;

    public AuthController(IAuthService authService, IApplicationDbContext context)
    {
        _authService = authService;
        _context = context;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
        }
    }

    [HttpPost("register-coaching")]
    public async Task<ActionResult<LoginResponse>> RegisterCoaching([FromBody] RegisterCoachingRequest request)
    {
        try
        {
            var response = await _authService.RegisterCoachingAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Include inner exception details for better debugging
            var errorMessage = ex.Message;
            if (ex.InnerException != null)
            {
                errorMessage += $" | Inner: {ex.InnerException.Message}";
            }
            return StatusCode(500, new { message = "An error occurred during registration", error = errorMessage, stackTrace = ex.StackTrace });
        }
    }

    [HttpGet("first-plan")]
    public async Task<ActionResult<PlanDto>> GetFirstPlan([FromQuery] string? billingPeriod = "Monthly")
    {
        try
        {
            var firstPlan = await _context.Plans
                .Where(p => p.IsActive && !p.IsDeleted && p.BillingPeriod == billingPeriod)
                .OrderBy(p => p.Id)
                .FirstOrDefaultAsync();
            
            // If no plan found for selected billing period, fallback to Monthly
            if (firstPlan == null && billingPeriod != "Monthly")
            {
                firstPlan = await _context.Plans
                    .Where(p => p.IsActive && !p.IsDeleted && p.BillingPeriod == "Monthly")
                    .OrderBy(p => p.Id)
                    .FirstOrDefaultAsync();
            }

            if (firstPlan == null)
            {
                return NotFound(new { message = "No active plan found" });
            }

            var planDto = new PlanDto
            {
                Id = firstPlan.Id,
                Name = firstPlan.Name,
                Description = firstPlan.Description,
                Price = firstPlan.Price,
                BillingPeriod = firstPlan.BillingPeriod,
                TrialDays = firstPlan.TrialDays,
                MaxUsers = firstPlan.MaxUsers,
                MaxCourses = firstPlan.MaxCourses,
                MaxStudents = firstPlan.MaxStudents,
                MaxTeachers = firstPlan.MaxTeachers
            };

            return Ok(planDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching plan", error = ex.Message });
        }
    }
}

