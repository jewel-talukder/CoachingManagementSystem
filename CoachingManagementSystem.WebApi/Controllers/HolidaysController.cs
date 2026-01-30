using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using CoachingManagementSystem.Application.Features.Holidays.DTOs;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HolidaysController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public HolidaysController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetAll()
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var holidays = await _context.Holidays
            .Include(h => h.Branch)
            .Where(h => h.CoachingId == coachingId.Value && !h.IsDeleted)
            .OrderByDescending(h => h.StartDate)
            .Select(h => new HolidayDto
            {
                Id = h.Id,
                CoachingId = h.CoachingId,
                BranchId = h.BranchId,
                BranchName = h.Branch != null ? h.Branch.Name : "All Branches",
                Name = h.Name,
                Description = h.Description,
                HolidayType = h.HolidayType,
                StartDate = h.StartDate,
                EndDate = h.EndDate,
                DaysOfWeek = h.DaysOfWeek,
                IsRecurring = h.IsRecurring,
                IsActive = h.IsActive
            })
            .ToListAsync();

        return Ok(holidays);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetById(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var holiday = await _context.Holidays
            .Include(h => h.Branch)
            .FirstOrDefaultAsync(h => h.Id == id && h.CoachingId == coachingId.Value && !h.IsDeleted);

        if (holiday == null)
            return NotFound(new { message = "Holiday not found" });

        var holidayDto = new HolidayDto
        {
            Id = holiday.Id,
            CoachingId = holiday.CoachingId,
            BranchId = holiday.BranchId,
            BranchName = holiday.Branch != null ? holiday.Branch.Name : "All Branches",
            Name = holiday.Name,
            Description = holiday.Description,
            HolidayType = holiday.HolidayType,
            StartDate = holiday.StartDate,
            EndDate = holiday.EndDate,
            DaysOfWeek = holiday.DaysOfWeek,
            DaysOfWeekList = !string.IsNullOrEmpty(holiday.DaysOfWeek) 
                ? JsonSerializer.Deserialize<List<int>>(holiday.DaysOfWeek) 
                : null,
            IsRecurring = holiday.IsRecurring,
            IsActive = holiday.IsActive
        };

        return Ok(holidayDto);
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreateHolidayRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Validate branch if provided
        if (request.BranchId.HasValue)
        {
            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == request.BranchId.Value && 
                                         b.CoachingId == coachingId.Value && 
                                         !b.IsDeleted);
            if (branch == null)
                return BadRequest(new { message = "Invalid branch" });
        }

        // Validate holiday type specific requirements
        if (request.HolidayType == "DateRange" && !request.EndDate.HasValue)
        {
            return BadRequest(new { message = "End date is required for date range holidays" });
        }

        if (request.HolidayType == "WeeklyOff" && (request.DaysOfWeek == null || request.DaysOfWeek.Count == 0))
        {
            return BadRequest(new { message = "At least one day of week is required for weekly off holidays" });
        }

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            var holiday = new Holiday
            {
                CoachingId = coachingId.Value,
                BranchId = request.BranchId,
                Name = request.Name,
                Description = request.Description,
                HolidayType = request.HolidayType,
                StartDate = request.StartDate.Date, // Store only date part
                EndDate = request.EndDate?.Date, // Store only date part if provided
                DaysOfWeek = request.DaysOfWeek != null && request.DaysOfWeek.Count > 0 
                    ? JsonSerializer.Serialize(request.DaysOfWeek) 
                    : null,
                IsRecurring = request.IsRecurring,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Holidays.Add(holiday);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var holidayDto = new HolidayDto
            {
                Id = holiday.Id,
                CoachingId = holiday.CoachingId,
                BranchId = holiday.BranchId,
                BranchName = holiday.BranchId.HasValue 
                    ? (await _context.Branches.FindAsync(holiday.BranchId.Value))?.Name ?? "Unknown"
                    : "All Branches",
                Name = holiday.Name,
                Description = holiday.Description,
                HolidayType = holiday.HolidayType,
                StartDate = holiday.StartDate,
                EndDate = holiday.EndDate,
                DaysOfWeek = holiday.DaysOfWeek,
                DaysOfWeekList = !string.IsNullOrEmpty(holiday.DaysOfWeek) 
                    ? JsonSerializer.Deserialize<List<int>>(holiday.DaysOfWeek) 
                    : null,
                IsRecurring = holiday.IsRecurring,
                IsActive = holiday.IsActive
            };

            return CreatedAtAction(nameof(GetById), new { id = holiday.Id }, holidayDto);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateHolidayRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var holiday = await _context.Holidays
            .FirstOrDefaultAsync(h => h.Id == id && h.CoachingId == coachingId.Value && !h.IsDeleted);

        if (holiday == null)
            return NotFound(new { message = "Holiday not found" });

        // Validate branch if provided
        if (request.BranchId.HasValue)
        {
            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == request.BranchId.Value && 
                                         b.CoachingId == coachingId.Value && 
                                         !b.IsDeleted);
            if (branch == null)
                return BadRequest(new { message = "Invalid branch" });
        }

        // Validate holiday type specific requirements
        if (request.HolidayType == "DateRange" && !request.EndDate.HasValue)
        {
            return BadRequest(new { message = "End date is required for date range holidays" });
        }

        if (request.HolidayType == "WeeklyOff" && (request.DaysOfWeek == null || request.DaysOfWeek.Count == 0))
        {
            return BadRequest(new { message = "At least one day of week is required for weekly off holidays" });
        }

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            holiday.BranchId = request.BranchId;
            holiday.Name = request.Name;
            holiday.Description = request.Description;
            holiday.HolidayType = request.HolidayType;
            holiday.StartDate = request.StartDate.Date; // Store only date part
            holiday.EndDate = request.EndDate?.Date; // Store only date part if provided
            holiday.DaysOfWeek = request.DaysOfWeek != null && request.DaysOfWeek.Count > 0 
                ? JsonSerializer.Serialize(request.DaysOfWeek) 
                : null;
            holiday.IsRecurring = request.IsRecurring;
            holiday.IsActive = request.IsActive;
            holiday.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var holidayDto = new HolidayDto
            {
                Id = holiday.Id,
                CoachingId = holiday.CoachingId,
                BranchId = holiday.BranchId,
                BranchName = holiday.BranchId.HasValue 
                    ? (await _context.Branches.FindAsync(holiday.BranchId.Value))?.Name ?? "Unknown"
                    : "All Branches",
                Name = holiday.Name,
                Description = holiday.Description,
                HolidayType = holiday.HolidayType,
                StartDate = holiday.StartDate,
                EndDate = holiday.EndDate,
                DaysOfWeek = holiday.DaysOfWeek,
                DaysOfWeekList = !string.IsNullOrEmpty(holiday.DaysOfWeek) 
                    ? JsonSerializer.Deserialize<List<int>>(holiday.DaysOfWeek) 
                    : null,
                IsRecurring = holiday.IsRecurring,
                IsActive = holiday.IsActive
            };

            return Ok(holidayDto);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var holiday = await _context.Holidays
            .FirstOrDefaultAsync(h => h.Id == id && h.CoachingId == coachingId.Value && !h.IsDeleted);

        if (holiday == null)
            return NotFound(new { message = "Holiday not found" });

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            holiday.IsDeleted = true;
            holiday.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Holiday deleted successfully" });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
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
}

