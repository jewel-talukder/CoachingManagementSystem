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

        // Filter for Student attendance only, to avoid NRE on Student navigation property
        attendanceQuery = attendanceQuery.Where(a => a.AttendanceType == "Student");

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

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
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
                    // Ensure type and approval are correct for student attendance
                    existing.AttendanceType = "Student";
                    existing.IsApproved = true; 
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
                        MarkedByUserId = userId,
                        AttendanceType = "Student",
                        IsApproved = true,
                        ApprovedByUserId = userId, // Auto-approve student attendance marked by teacher/admin
                    };
                    attendances.Add(attendance);
                }
            }

            if (attendances.Any())
            {
                _context.Attendances.AddRange(attendances);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Attendance marked successfully" });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPost("teacher/self")]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult> SubmitSelfAttendance([FromBody] TeacherAttendanceRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        // Find the teacher profile associated with this user
        var teacher = await _context.Teachers
            .Include(t => t.Shift)
            .FirstOrDefaultAsync(t => t.UserId == userId && t.CoachingId == coachingId.Value && !t.IsDeleted);

        if (teacher == null)
            return BadRequest(new { message = "Teacher profile not found for current user." });

        var date = request.Date.Date;

        // Check internal duplicates
        var existing = await _context.Attendances
            .FirstOrDefaultAsync(a => a.TeacherId == teacher.Id
                && a.AttendanceDate.Date == date
                && !a.IsDeleted);

        if (existing != null)
        {
            return BadRequest(new { message = "Attendance already submitted for this date." });
        }

        // Auto-calculate status based on Shift
        string status = "Present";
        if (teacher.Shift != null)
        {
            var checkInTime = request.Date.TimeOfDay;
            var shiftStart = teacher.Shift.StartTime;
            var graceTime = TimeSpan.FromMinutes(teacher.Shift.GraceTimeMinutes);
            
            if (checkInTime > shiftStart.Add(graceTime))
            {
                status = "Late";
            }
        }
        else
        {
            // If no shift assigned, use fallback or user provided status? 
            // For now, let's default to Present or respect request if we want to allow manual override when no shift.
            // Requirement implies strict shift logic. Defaulting to Present for no-shift teachers.
            status = "Present";
        }

        var attendance = new Attendance
        {
            CoachingId = coachingId.Value,
            TeacherId = teacher.Id,
            AttendanceDate = request.Date, 
            Status = status, 
            Remarks = request.Remarks,
            AttendanceType = "Teacher",
            IsApproved = false, // Requires admin approval
            MarkedByUserId = userId
        };

        _context.Attendances.Add(attendance);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Attendance submitted successfully. Pending approval." });
    }

    [HttpGet("pending")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetPendingAttendance()
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var pending = await _context.Attendances
            .Include(a => a.Teacher)
                .ThenInclude(t => t.User)
            .Where(a => a.CoachingId == coachingId.Value 
                && !a.IsApproved 
                && !a.IsDeleted
                && a.AttendanceType == "Teacher")
            .OrderByDescending(a => a.AttendanceDate)
            .Select(a => new
            {
                a.Id,
                TeacherName = $"{a.Teacher.User.FirstName} {a.Teacher.User.LastName}",
                a.AttendanceDate,
                a.Status,
                a.Remarks
            })
            .ToListAsync();

        return Ok(pending);
    }

    [HttpPost("approve/{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> ApproveAttendance(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var attendance = await _context.Attendances
            .FirstOrDefaultAsync(a => a.Id == id && a.CoachingId == coachingId.Value);

        if (attendance == null) return NotFound();

        attendance.IsApproved = true;
        attendance.ApprovedByUserId = userId;
        attendance.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Attendance approved." });
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
                BatchName = a.Batch != null ? a.Batch.Name : "N/A",
                AttendanceDate = a.AttendanceDate,
                Status = a.Status,
                Remarks = a.Remarks,
                IsApproved = a.IsApproved
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

public class TeacherAttendanceRequest
{
    public DateTime Date { get; set; }
    public string? Status { get; set; } // Optional, calculated by backend
    public string? Remarks { get; set; }
}

