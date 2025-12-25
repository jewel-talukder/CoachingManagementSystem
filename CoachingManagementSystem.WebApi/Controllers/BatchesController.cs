using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Features.Batches.DTOs;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BatchesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public BatchesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] int? courseId, [FromQuery] bool? isActive)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var batchesQuery = _context.Batches
            .Include(b => b.Course)
            .Include(b => b.Teacher)
                .ThenInclude(t => t!.User)
            .Where(b => b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (courseId.HasValue)
            batchesQuery = batchesQuery.Where(b => b.CourseId == courseId.Value);

        if (isActive.HasValue)
            batchesQuery = batchesQuery.Where(b => b.IsActive == isActive.Value);

        var batches = await batchesQuery
            .Select(b => new BatchDto
            {
                Id = b.Id,
                Name = b.Name,
                Code = b.Code,
                Description = b.Description,
                CourseId = b.CourseId,
                CourseName = b.Course.Name,
                TeacherId = b.TeacherId,
                TeacherName = b.Teacher != null ? $"{b.Teacher.User.FirstName} {b.Teacher.User.LastName}" : null,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                MaxStudents = b.MaxStudents,
                CurrentStudents = b.CurrentStudents,
                ScheduleDays = b.ScheduleDays,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                IsActive = b.IsActive
            })
            .ToListAsync();

        return Ok(batches);
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreateBatchRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Verify course exists and belongs to this coaching
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId && c.CoachingId == coachingId.Value && !c.IsDeleted);

        if (course == null)
            return NotFound(new { message = "Course not found" });

        var batch = new Batch
        {
            CoachingId = coachingId.Value,
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            CourseId = request.CourseId,
            TeacherId = request.TeacherId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            MaxStudents = request.MaxStudents,
            ScheduleDays = request.ScheduleDays,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            IsActive = true,
            CurrentStudents = 0
        };

        _context.Batches.Add(batch);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = batch.Id }, batch);
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

