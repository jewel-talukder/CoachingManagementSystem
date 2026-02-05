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
    public async Task<ActionResult> GetAttendance([FromQuery] int? batchId, [FromQuery] int? courseId, [FromQuery] DateTime? date)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        if (!batchId.HasValue && !courseId.HasValue)
            return BadRequest(new { message = "Either batchId or courseId must be provided" });

        var attendanceQuery = _context.Attendances
            .Include(a => a.Student)
                .ThenInclude(s => s.User)
            .Include(a => a.Batch)
            .Where(a => a.CoachingId == coachingId.Value && !a.IsDeleted);

        if (batchId.HasValue)
        {
            attendanceQuery = attendanceQuery.Where(a => a.BatchId == batchId.Value);
        }
        else if (courseId.HasValue)
        {
            // Get attendance for students enrolled in this course where BatchId is null (course-level attendance)
            var studentIds = await _context.Enrollments
                .Where(e => e.CourseId == courseId.Value && e.Status == "Active")
                .Select(e => e.StudentId)
                .ToListAsync();
            attendanceQuery = attendanceQuery.Where(a => studentIds.Contains(a.StudentId.Value) && a.BatchId == null);
        }

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

    [HttpPost("mark")]
    [Authorize(Roles = "Teacher,Coaching Admin,Super Admin")]
    public async Task<ActionResult> MarkAttendance([FromBody] MarkAttendanceRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // Validate that either batchId or courseId is provided
        if (!request.BatchId.HasValue && !request.CourseId.HasValue)
            return BadRequest(new { message = "Either BatchId or CourseId must be provided" });

        // Determine the batchId to use for attendance records
        int? attendanceBatchId = request.BatchId;
        
        if (request.BatchId.HasValue)
        {
            // Verify batch exists
            var batch = await _context.Batches
                .FirstOrDefaultAsync(b => b.Id == request.BatchId.Value && b.CoachingId == coachingId.Value && !b.IsDeleted);

            if (batch == null)
                return NotFound(new { message = "Batch not found" });
        }
        else if (request.CourseId.HasValue)
        {
            // Verify course exists
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId.Value && c.CoachingId == coachingId.Value && !c.IsDeleted);

            if (course == null)
                return NotFound(new { message = "Course not found" });
            
            // For course-wise attendance, we'll leave batchId as null
            attendanceBatchId = null;
        }

        var attendances = new List<Attendance>();

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            foreach (var item in request.AttendanceItems)
            {
                // Check if attendance already exists for this date
                var existingQuery = _context.Attendances
                    .Where(a => a.StudentId == item.StudentId 
                        && a.AttendanceDate.Date == request.Date.Date 
                        && !a.IsDeleted);

                if (request.BatchId.HasValue)
                    existingQuery = existingQuery.Where(a => a.BatchId == request.BatchId.Value);
                else
                    existingQuery = existingQuery.Where(a => a.BatchId == null);

                var existing = await existingQuery.FirstOrDefaultAsync();

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
                        BatchId = attendanceBatchId,
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
            var shiftEnd = teacher.Shift.EndTime;
            var graceTime = TimeSpan.FromMinutes(teacher.Shift.GraceTimeMinutes);
            
            // If shift is within the same day
            if (shiftEnd > shiftStart)
            {
                 if (checkInTime > shiftEnd)
                 {
                     status = "Absent";
                 }
                 else if (checkInTime > shiftStart.Add(graceTime))
                 {
                     status = "Late";
                 }
            }
            else // Night shift (crossing midnight) handling - simplistic check
            {
                 // Complex to handle without full date context shift assignment, 
                 // but for now assuming if checkIn is "late" relative to start
                 // We kept it simple. 
                 // If checkIn > ShiftStart + Grace (e.g. 23:00 > 22:30) -> Late
                 // If checkIn > ShiftEnd (e.g. 07:00 > 06:00) -> Absent? 
                 // (Need to be careful about AM/PM comparisons).
                 
                 // Fallback to basic Late calculation for night shifts to avoid bug
                 if (checkInTime > shiftStart.Add(graceTime) || (checkInTime < shiftStart && checkInTime > shiftEnd)) 
                 {
                      status = "Late"; // Simplified
                 }
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
    public async Task<ActionResult> GetPendingAttendance([FromQuery] int? branchId)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var query = _context.Attendances
            .Include(a => a.Teacher)
                .ThenInclude(t => t.User)
            .Include(a => a.Teacher)
                .ThenInclude(t => t.Shift)
            .Where(a => a.CoachingId == coachingId.Value 
                && !a.IsApproved 
                && !a.IsDeleted
                && a.AttendanceType == "Teacher");

        if (branchId.HasValue)
        {
            query = query.Where(a => a.Teacher.BranchId == branchId.Value);
        }

        var pending = await query
            .OrderByDescending(a => a.AttendanceDate)
            .Select(a => new
            {
                a.Id,
                TeacherName = $"{a.Teacher.User.FirstName} {a.Teacher.User.LastName}",
                a.AttendanceDate,
                a.Status,
                a.Remarks,
                ShiftName = a.Teacher.Shift != null ? a.Teacher.Shift.Name : "No Shift",
                ShiftStartTime = a.Teacher.Shift != null ? a.Teacher.Shift.StartTime.ToString() : null,
                ShiftEndTime = a.Teacher.Shift != null ? a.Teacher.Shift.EndTime.ToString() : null,
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

    [HttpGet("teacher/history")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetTeacherAttendance(
        [FromQuery] int? teacherId, 
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate,
        [FromQuery] int? branchId,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var query = _context.Attendances
            .Include(a => a.Teacher)
                .ThenInclude(t => t.User)
            .Include(a => a.Teacher)
                .ThenInclude(t => t.Shift)
            .Include(a => a.ApprovedByUser)
            .Where(a => a.CoachingId == coachingId.Value 
                && !a.IsDeleted
                && a.AttendanceType == "Teacher"
                && a.IsApproved);

        if (branchId.HasValue)
            query = query.Where(a => a.Teacher.BranchId == branchId.Value);

        if (teacherId.HasValue)
            query = query.Where(a => a.TeacherId == teacherId.Value);

        if (startDate.HasValue)
            query = query.Where(a => a.AttendanceDate.Date >= startDate.Value.Date);

        if (endDate.HasValue)
            query = query.Where(a => a.AttendanceDate.Date <= endDate.Value.Date);

        // Calculate total count before pagination
        var total = await query.CountAsync();

        var history = await query
            .OrderByDescending(a => a.AttendanceDate)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(a => new
            {
                a.Id,
                TeacherName = $"{a.Teacher.User.FirstName} {a.Teacher.User.LastName}",
                TeacherImage = a.Teacher.User.ProfilePicture,
                a.AttendanceDate,
                a.Status,
                a.Remarks,
                ShiftName = a.Teacher.Shift != null ? a.Teacher.Shift.Name : "No Shift",
                ShiftStartTime = a.Teacher.Shift != null ? a.Teacher.Shift.StartTime.ToString() : null,
                ShiftEndTime = a.Teacher.Shift != null ? a.Teacher.Shift.EndTime.ToString() : null,
                ApprovedBy = a.ApprovedByUser != null ? $"{a.ApprovedByUser.FirstName} {a.ApprovedByUser.LastName}" : "System/Auto"
            })
            .ToListAsync();

        return Ok(new 
        {
            Data = history,
            Total = total,
            Page = page,
            Limit = limit,
            TotalPages = (int)Math.Ceiling(total / (double)limit)
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
    public int? BatchId { get; set; }
    public int? CourseId { get; set; }
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

