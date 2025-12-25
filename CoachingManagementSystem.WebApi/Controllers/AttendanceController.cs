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
public class AttendanceController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AttendanceController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Teacher,Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetAttendance([FromQuery] int batchId, [FromQuery] DateTime? date)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var attendanceQuery = _context.Attendances
            .Include(a => a.Student)
                .ThenInclude(s => s.User)
            .Include(a => a.Batch)
            .Where(a => a.CoachingId == coachingId.Value && a.BatchId == batchId && !a.IsDeleted);

        if (date.HasValue)
        {
            attendanceQuery = attendanceQuery.Where(a => a.AttendanceDate.Date == date.Value.Date);
        }

        var attendance = await attendanceQuery
            .Select(a => new
            {
                Id = a.Id,
                StudentId = a.StudentId,
                StudentName = $"{a.Student.User.FirstName} {a.Student.User.LastName}",
                BatchId = a.BatchId,
                BatchName = a.Batch.Name,
                AttendanceDate = a.AttendanceDate,
                Status = a.Status,
                Remarks = a.Remarks
            })
            .ToListAsync();

        return Ok(attendance);
    }

    [HttpPost]
    [Authorize(Roles = "Teacher,Coaching Admin,Super Admin")]
    public async Task<ActionResult> MarkAttendance([FromBody] MarkAttendanceRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // Verify batch exists
        var batch = await _context.Batches
            .FirstOrDefaultAsync(b => b.Id == request.BatchId && b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (batch == null)
            return NotFound(new { message = "Batch not found" });

        var attendances = new List<Attendance>();

        foreach (var item in request.AttendanceItems)
        {
            // Check if attendance already exists for this date
            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.StudentId == item.StudentId 
                    && a.BatchId == request.BatchId 
                    && a.AttendanceDate.Date == request.Date.Date 
                    && !a.IsDeleted);

            if (existing != null)
            {
                existing.Status = item.Status;
                existing.Remarks = item.Remarks;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var attendance = new Attendance
                {
                    CoachingId = coachingId.Value,
                    StudentId = item.StudentId,
                    BatchId = request.BatchId,
                    AttendanceDate = request.Date,
                    Status = item.Status,
                    Remarks = item.Remarks,
                    MarkedByUserId = userId
                };
                attendances.Add(attendance);
            }
        }

        if (attendances.Any())
        {
            _context.Attendances.AddRange(attendances);
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Attendance marked successfully" });
    }

    [HttpGet("student/{studentId}")]
    [Authorize]
    public async Task<ActionResult> GetStudentAttendance(int studentId, [FromQuery] int? batchId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var attendanceQuery = _context.Attendances
            .Include(a => a.Batch)
            .Where(a => a.CoachingId == coachingId.Value && a.StudentId == studentId && !a.IsDeleted);

        if (batchId.HasValue)
            attendanceQuery = attendanceQuery.Where(a => a.BatchId == batchId.Value);

        if (startDate.HasValue)
            attendanceQuery = attendanceQuery.Where(a => a.AttendanceDate >= startDate.Value);

        if (endDate.HasValue)
            attendanceQuery = attendanceQuery.Where(a => a.AttendanceDate <= endDate.Value);

        var attendance = await attendanceQuery
            .OrderBy(a => a.AttendanceDate)
            .Select(a => new
            {
                Id = a.Id,
                BatchId = a.BatchId,
                BatchName = a.Batch.Name,
                AttendanceDate = a.AttendanceDate,
                Status = a.Status,
                Remarks = a.Remarks
            })
            .ToListAsync();

        // Calculate statistics
        var total = attendance.Count;
        var present = attendance.Count(a => a.Status == "Present");
        var absent = attendance.Count(a => a.Status == "Absent");
        var percentage = total > 0 ? (present * 100.0 / total) : 0;

        return Ok(new
        {
            Attendance = attendance,
            Statistics = new
            {
                Total = total,
                Present = present,
                Absent = absent,
                Percentage = Math.Round(percentage, 2)
            }
        });
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

public class MarkAttendanceRequest
{
    public int BatchId { get; set; }
    public DateTime Date { get; set; }
    public List<AttendanceItem> AttendanceItems { get; set; } = new();
}

public class AttendanceItem
{
    public int StudentId { get; set; }
    public string Status { get; set; } = "Present"; // Present, Absent, Late, Excused
    public string? Remarks { get; set; }
}

