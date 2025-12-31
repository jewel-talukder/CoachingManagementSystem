using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
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
    public async Task<ActionResult> GetAll([FromQuery] int? courseId, [FromQuery] bool? isActive, [FromQuery] int? branchId)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var batchesQuery = _context.Batches
            .Include(b => b.Course)
            .Include(b => b.Teacher)
                .ThenInclude(t => t!.User)
            .Where(b => b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (branchId.HasValue)
            batchesQuery = batchesQuery.Where(b => b.BranchId == branchId.Value);

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

        // Get branchId from query or use default branch
        int? branchId = null;
        if (Request.Query.ContainsKey("branchId") && int.TryParse(Request.Query["branchId"], out var parsedBranchId))
        {
            branchId = parsedBranchId;
        }
        else
        {
            // Get default branch
            var defaultBranch = await _context.Branches
                .FirstOrDefaultAsync(b => b.CoachingId == coachingId.Value && b.IsDefault && !b.IsDeleted);
            if (defaultBranch != null)
                branchId = defaultBranch.Id;
        }

        if (!branchId.HasValue)
        {
            return BadRequest(new { message = "Branch is required" });
        }

        // Verify course exists and belongs to this branch
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId && c.CoachingId == coachingId.Value && c.BranchId == branchId.Value && !c.IsDeleted);

        if (course == null)
            return NotFound(new { message = "Course not found" });

        // Check if batch code already exists for this branch (if code is provided)
        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            var existingBatch = await _context.Batches
                .FirstOrDefaultAsync(b => b.BranchId == branchId.Value && 
                                         b.Code == request.Code && 
                                         !b.IsDeleted);
            
            if (existingBatch != null)
            {
                return Conflict(new { message = $"A batch with code '{request.Code}' already exists in this branch. Please use a different code." });
            }
        }

        // Calculate end date based on course duration if not provided
        DateTime? calculatedEndDate = request.EndDate;
        if (!calculatedEndDate.HasValue && course.DurationMonths > 0)
        {
            calculatedEndDate = request.StartDate.AddMonths(course.DurationMonths);
        }

        // Convert DaySchedules to JSON string if provided
        string? scheduleDaysJson = request.ScheduleDays;
        if (request.DaySchedules != null && request.DaySchedules.Any())
        {
            scheduleDaysJson = JsonSerializer.Serialize(request.DaySchedules);
        }
        else if (string.IsNullOrEmpty(scheduleDaysJson) && (request.StartTime.HasValue || request.EndTime.HasValue))
        {
            // Legacy support: convert old StartTime/EndTime to new format if ScheduleDays is not provided
            // This is a fallback for backward compatibility
        }

        var batch = new Batch
        {
            CoachingId = coachingId.Value,
            BranchId = branchId.Value,
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            CourseId = request.CourseId,
            TeacherId = request.TeacherId,
            StartDate = request.StartDate,
            EndDate = calculatedEndDate,
            MaxStudents = request.MaxStudents,
            ScheduleDays = scheduleDaysJson,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            IsActive = true,
            CurrentStudents = 0
        };

        _context.Batches.Add(batch);
        await _context.SaveChangesAsync();

        // Reload with related data to create DTO
        var createdBatch = await _context.Batches
            .Include(b => b.Course)
            .Include(b => b.Teacher)
                .ThenInclude(t => t!.User)
            .FirstOrDefaultAsync(b => b.Id == batch.Id);

        if (createdBatch == null)
            return NotFound(new { message = "Batch not found after creation" });

        var batchDto = new BatchDto
        {
            Id = createdBatch.Id,
            Name = createdBatch.Name,
            Code = createdBatch.Code,
            Description = createdBatch.Description,
            CourseId = createdBatch.CourseId,
            CourseName = createdBatch.Course.Name,
            TeacherId = createdBatch.TeacherId,
            TeacherName = createdBatch.Teacher != null ? $"{createdBatch.Teacher.User.FirstName} {createdBatch.Teacher.User.LastName}" : null,
            StartDate = createdBatch.StartDate,
            EndDate = createdBatch.EndDate,
            MaxStudents = createdBatch.MaxStudents,
            CurrentStudents = createdBatch.CurrentStudents,
            ScheduleDays = createdBatch.ScheduleDays,
            StartTime = createdBatch.StartTime,
            EndTime = createdBatch.EndTime,
            IsActive = createdBatch.IsActive
        };

        return CreatedAtAction(nameof(GetAll), new { id = batchDto.Id }, batchDto);
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

