using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Application.Features.Specializations.DTOs;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SpecializationsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SpecializationsController(IApplicationDbContext context)
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

    [HttpGet]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<IEnumerable<SpecializationDto>>> GetAll([FromQuery] bool? isActive)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var specializationsQuery = _context.Specializations
            .Where(s => s.CoachingId == coachingId.Value && !s.IsDeleted);

        if (isActive.HasValue)
            specializationsQuery = specializationsQuery.Where(s => s.IsActive == isActive.Value);

        var specializations = await specializationsQuery
            .Select(s => new SpecializationDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                IsActive = s.IsActive,
                TeacherCount = s.Teachers.Count(t => !t.IsDeleted)
            })
            .OrderBy(s => s.Name)
            .ToListAsync();

        return Ok(specializations);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<SpecializationDto>> GetById(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var specialization = await _context.Specializations
            .FirstOrDefaultAsync(s => s.Id == id && s.CoachingId == coachingId.Value && !s.IsDeleted);

        if (specialization == null)
            return NotFound(new { message = "Specialization not found" });

        var teacherCount = await _context.Teachers
            .CountAsync(t => t.SpecializationId == id && !t.IsDeleted);

        return Ok(new SpecializationDto
        {
            Id = specialization.Id,
            Name = specialization.Name,
            Description = specialization.Description,
            IsActive = specialization.IsActive,
            TeacherCount = teacherCount
        });
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<SpecializationDto>> Create([FromBody] CreateSpecializationRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Validate input
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Specialization name is required" });

        // Check if specialization with same name already exists
        var existing = await _context.Specializations
            .FirstOrDefaultAsync(s => s.CoachingId == coachingId.Value && 
                                     s.Name.ToLower() == request.Name.Trim().ToLower() && 
                                     !s.IsDeleted);

        if (existing != null)
            return BadRequest(new { message = "Specialization with this name already exists" });

        var specialization = new Specialization
        {
            CoachingId = coachingId.Value,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsActive = true
        };

        _context.Specializations.Add(specialization);
        await _context.SaveChangesAsync();

        var teacherCount = await _context.Teachers
            .CountAsync(t => t.SpecializationId == specialization.Id && !t.IsDeleted);

        var specializationDto = new SpecializationDto
        {
            Id = specialization.Id,
            Name = specialization.Name,
            Description = specialization.Description,
            IsActive = specialization.IsActive,
            TeacherCount = teacherCount
        };

        return CreatedAtAction(nameof(GetById), new { id = specialization.Id }, specializationDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateSpecializationRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var specialization = await _context.Specializations
            .FirstOrDefaultAsync(s => s.Id == id && s.CoachingId == coachingId.Value && !s.IsDeleted);

        if (specialization == null)
            return NotFound(new { message = "Specialization not found" });

        // Check if new name conflicts with existing specialization
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            var trimmedName = request.Name.Trim();
            if (trimmedName.ToLower() != specialization.Name.ToLower())
            {
                var existing = await _context.Specializations
                    .FirstOrDefaultAsync(s => s.CoachingId == coachingId.Value && 
                                             s.Id != id &&
                                             s.Name.ToLower() == trimmedName.ToLower() && 
                                             !s.IsDeleted);

                if (existing != null)
                    return BadRequest(new { message = "Specialization with this name already exists" });

                specialization.Name = trimmedName;
            }
        }
        if (request.Description != null)
            specialization.Description = request.Description.Trim();
        if (request.IsActive.HasValue)
            specialization.IsActive = request.IsActive.Value;

        specialization.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Specialization updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var specialization = await _context.Specializations
            .FirstOrDefaultAsync(s => s.Id == id && s.CoachingId == coachingId.Value && !s.IsDeleted);

        if (specialization == null)
            return NotFound(new { message = "Specialization not found" });

        // Check if specialization is used by any teachers
        var hasTeachers = await _context.Teachers
            .AnyAsync(t => t.SpecializationId == id && !t.IsDeleted);

        if (hasTeachers)
            return BadRequest(new { message = "Cannot delete specialization that is assigned to teachers. Please reassign teachers first." });

        // Soft delete
        specialization.IsDeleted = true;
        specialization.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Specialization deleted successfully" });
    }
}

