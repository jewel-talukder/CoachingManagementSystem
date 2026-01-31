using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Domain.Entities;
using CoachingManagementSystem.Application.Features.Shifts.DTOs;
using System.Globalization;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShiftsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ShiftsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Coaching Admin,Super Admin,Teacher")]
    public async Task<ActionResult<IEnumerable<ShiftDto>>> GetAll()
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var shifts = await _context.Shifts
            .Where(s => s.CoachingId == coachingId.Value && !s.IsDeleted)
            .OrderBy(s => s.StartTime)
            .Select(s => new ShiftDto
            {
                Id = s.Id,
                Name = s.Name,
                StartTime = DateTime.Today.Add(s.StartTime).ToString("hh:mm tt"),
                EndTime = DateTime.Today.Add(s.EndTime).ToString("hh:mm tt"),
                GraceTimeMinutes = s.GraceTimeMinutes
            })
            .ToListAsync();

        return Ok(shifts);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<ShiftDto>> GetById(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var shift = await _context.Shifts
            .FirstOrDefaultAsync(s => s.Id == id && s.CoachingId == coachingId.Value && !s.IsDeleted);

        if (shift == null) return NotFound();

        return Ok(new ShiftDto
        {
            Id = shift.Id,
            Name = shift.Name,
            StartTime = DateTime.Today.Add(shift.StartTime).ToString("hh:mm tt"),
            EndTime = DateTime.Today.Add(shift.EndTime).ToString("hh:mm tt"),
            GraceTimeMinutes = shift.GraceTimeMinutes
        });
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<ShiftDto>> Create(CreateShiftRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        if (!TimeSpan.TryParse(request.StartTime, out var startTime))
            return BadRequest(new { message = "Invalid Start Time format" });

        if (!TimeSpan.TryParse(request.EndTime, out var endTime))
            return BadRequest(new { message = "Invalid End Time format" });

        var shift = new Shift
        {
            CoachingId = coachingId.Value,
            Name = request.Name,
            StartTime = startTime,
            EndTime = endTime,
            GraceTimeMinutes = request.GraceTimeMinutes
        };

        _context.Shifts.Add(shift);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = shift.Id }, new ShiftDto
        {
            Id = shift.Id,
            Name = shift.Name,
            StartTime = DateTime.Today.Add(shift.StartTime).ToString("hh:mm tt"),
            EndTime = DateTime.Today.Add(shift.EndTime).ToString("hh:mm tt"),
            GraceTimeMinutes = shift.GraceTimeMinutes
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Update(int id, UpdateShiftRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var shift = await _context.Shifts
            .FirstOrDefaultAsync(s => s.Id == id && s.CoachingId == coachingId.Value && !s.IsDeleted);

        if (shift == null) return NotFound();

        if (TimeSpan.TryParse(request.StartTime, out var startTime))
            shift.StartTime = startTime;

        if (TimeSpan.TryParse(request.EndTime, out var endTime))
            shift.EndTime = endTime;

        if (!string.IsNullOrEmpty(request.Name))
            shift.Name = request.Name;

        shift.GraceTimeMinutes = request.GraceTimeMinutes;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var shift = await _context.Shifts
            .FirstOrDefaultAsync(s => s.Id == id && s.CoachingId == coachingId.Value && !s.IsDeleted);

        if (shift == null) return NotFound();

        // Check if any teachers are assigned
        var hasTeachers = await _context.Teachers.AnyAsync(t => t.ShiftId == id && !t.IsDeleted);
        if (hasTeachers)
            return BadRequest(new { message = "Cannot delete shift as it is assigned to teachers." });

        shift.IsDeleted = true;
        await _context.SaveChangesAsync();

        return NoContent();
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
