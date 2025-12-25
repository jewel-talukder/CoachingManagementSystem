using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;
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
            .Select(e => new
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

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreateEnrollmentRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Verify student exists
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && s.CoachingId == coachingId.Value && !s.IsDeleted);

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

        var enrollment = new Enrollment
        {
            CoachingId = coachingId.Value,
            StudentId = request.StudentId,
            CourseId = request.CourseId,
            BatchId = request.BatchId,
            EnrollmentDate = DateTime.UtcNow,
            Status = "Active",
            FeePaid = request.FeePaid,
            TotalFee = course.Fee ?? request.TotalFee
        };

        _context.Enrollments.Add(enrollment);

        // Update batch current students count
        batch.CurrentStudents++;
        batch.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = enrollment.Id }, enrollment);
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

        enrollment.Status = "Cancelled";
        enrollment.UpdatedAt = DateTime.UtcNow;

        // Update batch current students count
        if (enrollment.Batch != null && enrollment.Status == "Active")
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

public class CreateEnrollmentRequest
{
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public int BatchId { get; set; }
    public decimal? FeePaid { get; set; }
    public decimal? TotalFee { get; set; }
}

