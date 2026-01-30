using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Application.Features.Qualifications.DTOs;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QualificationsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public QualificationsController(IApplicationDbContext context)
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
    public async Task<ActionResult<IEnumerable<QualificationDto>>> GetAll([FromQuery] bool? isActive)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var qualificationsQuery = _context.Qualifications
            .Where(q => q.CoachingId == coachingId.Value && !q.IsDeleted);

        if (isActive.HasValue)
            qualificationsQuery = qualificationsQuery.Where(q => q.IsActive == isActive.Value);

        var qualifications = await qualificationsQuery
            .Select(q => new QualificationDto
            {
                Id = q.Id,
                Name = q.Name,
                Description = q.Description,
                IsActive = q.IsActive,
                TeacherCount = q.Teachers.Count(t => !t.IsDeleted)
            })
            .OrderBy(q => q.Name)
            .ToListAsync();

        return Ok(qualifications);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<QualificationDto>> GetById(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var qualification = await _context.Qualifications
            .FirstOrDefaultAsync(q => q.Id == id && q.CoachingId == coachingId.Value && !q.IsDeleted);

        if (qualification == null)
            return NotFound(new { message = "Qualification not found" });

        var teacherCount = await _context.Teachers
            .CountAsync(t => t.QualificationId == id && !t.IsDeleted);

        return Ok(new QualificationDto
        {
            Id = qualification.Id,
            Name = qualification.Name,
            Description = qualification.Description,
            IsActive = qualification.IsActive,
            TeacherCount = teacherCount
        });
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<QualificationDto>> Create([FromBody] CreateQualificationRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Validate input
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Qualification name is required" });

        // Check if qualification with same name already exists
        var existing = await _context.Qualifications
            .FirstOrDefaultAsync(q => q.CoachingId == coachingId.Value && 
                                     q.Name.ToLower() == request.Name.Trim().ToLower() && 
                                     !q.IsDeleted);

        if (existing != null)
            return BadRequest(new { message = "Qualification with this name already exists" });

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            var qualification = new Qualification
            {
                CoachingId = coachingId.Value,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                IsActive = true
            };

            _context.Qualifications.Add(qualification);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var teacherCount = await _context.Teachers
                .CountAsync(t => t.QualificationId == qualification.Id && !t.IsDeleted);

            var qualificationDto = new QualificationDto
            {
                Id = qualification.Id,
                Name = qualification.Name,
                Description = qualification.Description,
                IsActive = qualification.IsActive,
                TeacherCount = teacherCount
            };

            return CreatedAtAction(nameof(GetById), new { id = qualification.Id }, qualificationDto);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateQualificationRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var qualification = await _context.Qualifications
            .FirstOrDefaultAsync(q => q.Id == id && q.CoachingId == coachingId.Value && !q.IsDeleted);

        if (qualification == null)
            return NotFound(new { message = "Qualification not found" });

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            // Check if new name conflicts with existing qualification
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                var trimmedName = request.Name.Trim();
                if (trimmedName.ToLower() != qualification.Name.ToLower())
                {
                    var existing = await _context.Qualifications
                        .FirstOrDefaultAsync(q => q.CoachingId == coachingId.Value && 
                                                q.Id != id &&
                                                q.Name.ToLower() == trimmedName.ToLower() && 
                                                !q.IsDeleted);

                    if (existing != null)
                        return BadRequest(new { message = "Qualification with this name already exists" });

                    qualification.Name = trimmedName;
                }
            }
            if (request.Description != null)
                qualification.Description = request.Description.Trim();
            if (request.IsActive.HasValue)
                qualification.IsActive = request.IsActive.Value;

            qualification.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Qualification updated successfully" });
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

        var qualification = await _context.Qualifications
            .FirstOrDefaultAsync(q => q.Id == id && q.CoachingId == coachingId.Value && !q.IsDeleted);

        if (qualification == null)
            return NotFound(new { message = "Qualification not found" });

        // Check if qualification is used by any teachers
        var hasTeachers = await _context.Teachers
            .AnyAsync(t => t.QualificationId == id && !t.IsDeleted);

        if (hasTeachers)
            return BadRequest(new { message = "Cannot delete qualification that is assigned to teachers. Please reassign teachers first." });

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            // Soft delete
            qualification.IsDeleted = true;
            qualification.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Qualification deleted successfully" });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}

