using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Application.Features.Enrollments.DTOs;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public EnrollmentsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetAll([FromQuery] int? courseId, [FromQuery] int? batchId, [FromQuery] int? studentId, [FromQuery] string? status)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var enrollmentsQuery = _context.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.User)
            .Include(e => e.Course)
            .Include(e => e.Batch)
            .Where(e => e.CoachingId == coachingId.Value);

        if (courseId.HasValue)
            enrollmentsQuery = enrollmentsQuery.Where(e => e.CourseId == courseId.Value);

        if (batchId.HasValue)
            enrollmentsQuery = enrollmentsQuery.Where(e => e.BatchId == batchId.Value);

        if (studentId.HasValue)
            enrollmentsQuery = enrollmentsQuery.Where(e => e.StudentId == studentId.Value);

        if (!string.IsNullOrEmpty(status))
            enrollmentsQuery = enrollmentsQuery.Where(e => e.Status == status);

        var enrollments = await enrollmentsQuery
            .Select(e => new EnrollmentDto
            {
                Id = e.Id,
                StudentId = e.StudentId,
                StudentName = $"{e.Student.User.FirstName} {e.Student.User.LastName}",
                CourseId = e.CourseId,
                CourseName = e.Course.Name,
                BatchId = e.BatchId,
                BatchName = e.Batch.Name,
                EnrollmentDate = e.EnrollmentDate,
                CompletionDate = e.CompletionDate,
                Status = e.Status,
                FeePaid = e.FeePaid,
                TotalFee = e.TotalFee
            })
            .ToListAsync();

        return Ok(enrollments);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<EnrollmentDto>> GetById(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.User)
            .Include(e => e.Course)
            .Include(e => e.Batch)
            .Where(e => e.Id == id && e.CoachingId == coachingId.Value)
            .Select(e => new EnrollmentDto
            {
                Id = e.Id,
                StudentId = e.StudentId,
                StudentName = $"{e.Student.User.FirstName} {e.Student.User.LastName}",
                CourseId = e.CourseId,
                CourseName = e.Course.Name,
                BatchId = e.BatchId,
                BatchName = e.Batch.Name,
                EnrollmentDate = e.EnrollmentDate,
                CompletionDate = e.CompletionDate,
                Status = e.Status,
                FeePaid = e.FeePaid,
                TotalFee = e.TotalFee
            })
            .FirstOrDefaultAsync();

        if (enrollment == null)
            return NotFound(new { message = "Enrollment not found" });

        return Ok(enrollment);
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreateEnrollmentRequest request)
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
            var defaultBranch = await _context.Branches
                .FirstOrDefaultAsync(b => b.CoachingId == coachingId.Value && b.IsDefault && !b.IsDeleted);
            if (defaultBranch != null)
                branchId = defaultBranch.Id;
        }

        if (!branchId.HasValue)
            return BadRequest(new { message = "Branch is required" });

        // Verify student exists - Check both PK and UserId for robustness
        var student = await _context.Students
            .FirstOrDefaultAsync(s => (s.Id == request.StudentId || s.UserId == request.StudentId) && s.CoachingId == coachingId.Value && !s.IsDeleted);

        if (student == null)
            return NotFound(new { message = "Student not found" });

        // Verify course exists
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId && c.CoachingId == coachingId.Value && !c.IsDeleted);

        if (course == null)
            return NotFound(new { message = "Course not found" });

        // Verify batch exists and has space
        var batch = await _context.Batches
            .FirstOrDefaultAsync(b => b.Id == request.BatchId && b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (batch == null)
            return NotFound(new { message = "Batch not found" });

        if (batch.CurrentStudents >= batch.MaxStudents)
            return BadRequest(new { message = "Batch is full" });

        // Check if student is already enrolled in this batch
        var existingEnrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == request.StudentId && 
                                     e.BatchId == request.BatchId && 
                                     e.Status == "Active");

        if (existingEnrollment != null)
            return BadRequest(new { message = "Student is already enrolled in this batch" });

        // Calculate TotalFee: Batch MonthlyFee × Course DurationMonths
        decimal? calculatedTotalFee = null;
        if (batch.MonthlyFee > 0 && course.DurationMonths > 0)
        {
            calculatedTotalFee = batch.MonthlyFee * course.DurationMonths;
        }
        else if (request.TotalFee.HasValue)
        {
            calculatedTotalFee = request.TotalFee.Value;
        }
        else if (course.Fee.HasValue)
        {
            // Fallback to course fee if batch monthly fee is not set
            calculatedTotalFee = course.Fee.Value;
        }

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            var enrollment = new Enrollment
            {
                CoachingId = coachingId.Value,
                BranchId = branchId.Value,
                StudentId = request.StudentId,
                CourseId = request.CourseId,
                BatchId = request.BatchId,
                EnrollmentDate = DateTime.UtcNow,
                Status = "Active",
                FeePaid = request.FeePaid,
                TotalFee = calculatedTotalFee
            };

            _context.Enrollments.Add(enrollment);

            // Update batch current students count
            batch.CurrentStudents++;
            batch.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetById), new { id = enrollment.Id }, enrollment);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateEnrollmentRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var enrollment = await _context.Enrollments
            .Include(e => e.Batch)
            .FirstOrDefaultAsync(e => e.Id == id && e.CoachingId == coachingId.Value);

        if (enrollment == null)
            return NotFound(new { message = "Enrollment not found" });

        var oldBatchId = enrollment.BatchId;
        var oldStatus = enrollment.Status;

        // Update fields if provided
        if (request.StudentId.HasValue)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.Id == request.StudentId.Value && s.CoachingId == coachingId.Value && !s.IsDeleted);
            if (student == null)
                return NotFound(new { message = "Student not found" });
            enrollment.StudentId = request.StudentId.Value;
        }

        if (request.CourseId.HasValue)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId.Value && c.CoachingId == coachingId.Value && !c.IsDeleted);
            if (course == null)
                return NotFound(new { message = "Course not found" });
            enrollment.CourseId = request.CourseId.Value;
            
            // Recalculate total fee: Batch MonthlyFee × Course DurationMonths
            var batch = await _context.Batches
                .FirstOrDefaultAsync(b => b.Id == enrollment.BatchId && !b.IsDeleted);
            if (batch != null && batch.MonthlyFee > 0 && course.DurationMonths > 0)
            {
                enrollment.TotalFee = batch.MonthlyFee * course.DurationMonths;
            }
            else if (course.Fee.HasValue)
            {
                // Fallback to course fee if batch monthly fee is not set
                enrollment.TotalFee = course.Fee.Value;
            }
        }

        if (request.BatchId.HasValue && request.BatchId.Value != enrollment.BatchId)
        {
            var newBatch = await _context.Batches
                .FirstOrDefaultAsync(b => b.Id == request.BatchId.Value && b.CoachingId == coachingId.Value && !b.IsDeleted);
            if (newBatch == null)
                return NotFound(new { message = "Batch not found" });

            if (newBatch.CurrentStudents >= newBatch.MaxStudents)
                return BadRequest(new { message = "New batch is full" });

            // Update old batch count
            if (enrollment.Batch != null && oldStatus == "Active")
            {
                enrollment.Batch.CurrentStudents = Math.Max(0, enrollment.Batch.CurrentStudents - 1);
                enrollment.Batch.UpdatedAt = DateTime.UtcNow;
            }

            // Update new batch count
            if (enrollment.Status == "Active")
            {
                newBatch.CurrentStudents++;
                newBatch.UpdatedAt = DateTime.UtcNow;
            }

            enrollment.BatchId = request.BatchId.Value;
        }

        if (!string.IsNullOrEmpty(request.Status))
        {
            enrollment.Status = request.Status;
            if (request.Status == "Completed" && enrollment.CompletionDate == null)
                enrollment.CompletionDate = DateTime.UtcNow;
        }

        if (request.FeePaid.HasValue)
            enrollment.FeePaid = request.FeePaid;

        if (request.TotalFee.HasValue)
            enrollment.TotalFee = request.TotalFee;

        enrollment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Enrollment updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var enrollment = await _context.Enrollments
            .Include(e => e.Batch)
            .FirstOrDefaultAsync(e => e.Id == id && e.CoachingId == coachingId.Value);

        if (enrollment == null)
            return NotFound(new { message = "Enrollment not found" });

        // Update batch current students count if enrollment was active
        if (enrollment.Batch != null && enrollment.Status == "Active")
        {
            enrollment.Batch.CurrentStudents = Math.Max(0, enrollment.Batch.CurrentStudents - 1);
            enrollment.Batch.UpdatedAt = DateTime.UtcNow;
        }

        // Soft delete
        enrollment.IsDeleted = true;
        enrollment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Enrollment deleted successfully" });
    }

    [HttpPut("{id}/complete")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> CompleteEnrollment(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var enrollment = await _context.Enrollments
            .Include(e => e.Batch)
            .FirstOrDefaultAsync(e => e.Id == id && e.CoachingId == coachingId.Value);

        if (enrollment == null)
            return NotFound(new { message = "Enrollment not found" });

        enrollment.Status = "Completed";
        enrollment.CompletionDate = DateTime.UtcNow;
        enrollment.UpdatedAt = DateTime.UtcNow;

        // Update batch current students count
        if (enrollment.Batch != null)
        {
            enrollment.Batch.CurrentStudents = Math.Max(0, enrollment.Batch.CurrentStudents - 1);
            enrollment.Batch.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Enrollment completed successfully" });
    }

    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> CancelEnrollment(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var enrollment = await _context.Enrollments
            .Include(e => e.Batch)
            .FirstOrDefaultAsync(e => e.Id == id && e.CoachingId == coachingId.Value);

        if (enrollment == null)
            return NotFound(new { message = "Enrollment not found" });

        var oldStatus = enrollment.Status;
        enrollment.Status = "Cancelled";
        enrollment.UpdatedAt = DateTime.UtcNow;

        // Update batch current students count if enrollment was active
        if (enrollment.Batch != null && oldStatus == "Active")
        {
            enrollment.Batch.CurrentStudents = Math.Max(0, enrollment.Batch.CurrentStudents - 1);
            enrollment.Batch.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Enrollment cancelled successfully" });
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

