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
    public async Task<ActionResult> GetAll([FromQuery] bool? isActive, [FromQuery] int? branchId)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var batchesQuery = _context.Batches
            .Include(b => b.Teacher)
                .ThenInclude(t => t!.User)
            .Where(b => b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (branchId.HasValue)
            batchesQuery = batchesQuery.Where(b => b.BranchId == branchId.Value);

        if (isActive.HasValue)
            batchesQuery = batchesQuery.Where(b => b.IsActive == isActive.Value);

        var batches = await batchesQuery
            .Select(b => new BatchDto
            {
                Id = b.Id,
                Name = b.Name,
                Code = b.Code,
                Description = b.Description,
                TeacherId = b.TeacherId,
                TeacherName = b.Teacher != null ? $"{b.Teacher.User.FirstName} {b.Teacher.User.LastName}" : null,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                MaxStudents = b.MaxStudents,
                CurrentStudents = b.CurrentStudents,
                MonthlyFee = b.MonthlyFee,
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

        // Use provided end date or leave null
        DateTime? calculatedEndDate = request.EndDate;

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
            TeacherId = request.TeacherId,
            StartDate = request.StartDate,
            EndDate = calculatedEndDate,
            MaxStudents = request.MaxStudents,
            MonthlyFee = request.MonthlyFee,
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
            TeacherId = createdBatch.TeacherId,
            TeacherName = createdBatch.Teacher != null ? $"{createdBatch.Teacher.User.FirstName} {createdBatch.Teacher.User.LastName}" : null,
            StartDate = createdBatch.StartDate,
            EndDate = createdBatch.EndDate,
            MaxStudents = createdBatch.MaxStudents,
            CurrentStudents = createdBatch.CurrentStudents,
            MonthlyFee = createdBatch.MonthlyFee,
            ScheduleDays = createdBatch.ScheduleDays,
            StartTime = createdBatch.StartTime,
            EndTime = createdBatch.EndTime,
            IsActive = createdBatch.IsActive
        };

        return CreatedAtAction(nameof(GetAll), new { id = batchDto.Id }, batchDto);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetById(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var batch = await _context.Batches
            .Include(b => b.Teacher)
                .ThenInclude(t => t!.User)
            .FirstOrDefaultAsync(b => b.Id == id && b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (batch == null)
            return NotFound(new { message = "Batch not found" });

        var batchDto = new BatchDto
        {
            Id = batch.Id,
            Name = batch.Name,
            Code = batch.Code,
            Description = batch.Description,
            TeacherId = batch.TeacherId,
            TeacherName = batch.Teacher != null ? $"{batch.Teacher.User.FirstName} {batch.Teacher.User.LastName}" : null,
            StartDate = batch.StartDate,
            EndDate = batch.EndDate,
            MaxStudents = batch.MaxStudents,
            CurrentStudents = batch.CurrentStudents,
            MonthlyFee = batch.MonthlyFee,
            ScheduleDays = batch.ScheduleDays,
            StartTime = batch.StartTime,
            EndTime = batch.EndTime,
            IsActive = batch.IsActive
        };

        return Ok(batchDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateBatchRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var batch = await _context.Batches
            .FirstOrDefaultAsync(b => b.Id == id && b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (batch == null)
            return NotFound(new { message = "Batch not found" });

        // Check if batch code already exists for another batch (if code is being changed)
        if (!string.IsNullOrWhiteSpace(request.Code) && request.Code != batch.Code)
        {
            var existingBatch = await _context.Batches
                .FirstOrDefaultAsync(b => b.BranchId == batch.BranchId && 
                                         b.Code == request.Code && 
                                         b.Id != id &&
                                         !b.IsDeleted);
            
            if (existingBatch != null)
            {
                return Conflict(new { message = $"A batch with code '{request.Code}' already exists in this branch. Please use a different code." });
            }
        }

        // Convert DaySchedules to JSON string if provided
        string? scheduleDaysJson = request.ScheduleDays;
        if (request.DaySchedules != null && request.DaySchedules.Any())
        {
            scheduleDaysJson = JsonSerializer.Serialize(request.DaySchedules);
        }

        // Update batch properties
        batch.Name = request.Name;
        if (request.Code != null)
            batch.Code = request.Code;
        if (request.Description != null)
            batch.Description = request.Description;
        if (request.TeacherId.HasValue)
            batch.TeacherId = request.TeacherId.Value;
        if (request.StartDate.HasValue)
            batch.StartDate = request.StartDate.Value;
        if (request.EndDate.HasValue)
            batch.EndDate = request.EndDate.Value;
        if (request.MaxStudents.HasValue)
            batch.MaxStudents = request.MaxStudents.Value;
        if (request.MonthlyFee.HasValue)
            batch.MonthlyFee = request.MonthlyFee.Value;
        if (scheduleDaysJson != null)
            batch.ScheduleDays = scheduleDaysJson;
        if (request.StartTime.HasValue)
            batch.StartTime = request.StartTime.Value;
        if (request.EndTime.HasValue)
            batch.EndTime = request.EndTime.Value;
        batch.IsActive = request.IsActive;
        batch.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Batch updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var batch = await _context.Batches
            .FirstOrDefaultAsync(b => b.Id == id && b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (batch == null)
            return NotFound(new { message = "Batch not found" });

        // Check if batch has any enrollments
        var hasEnrollments = await _context.Enrollments
            .AnyAsync(e => e.BatchId == id && e.Status == "Active");

        if (hasEnrollments)
        {
            return BadRequest(new { message = "Cannot delete batch with active enrollments. Please complete or cancel all enrollments first." });
        }

        // Soft delete
        batch.IsDeleted = true;
        batch.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Batch deleted successfully" });
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

