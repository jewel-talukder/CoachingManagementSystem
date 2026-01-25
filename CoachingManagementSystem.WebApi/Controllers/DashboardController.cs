using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public DashboardController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("coaching-admin")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetCoachingAdminDashboard()
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var totalStudents = await _context.Students
            .CountAsync(s => s.CoachingId == coachingId.Value && !s.IsDeleted);

        var totalTeachers = await _context.Teachers
            .CountAsync(t => t.CoachingId == coachingId.Value && !t.IsDeleted);

        var totalCourses = await _context.Courses
            .CountAsync(c => c.CoachingId == coachingId.Value && !c.IsDeleted);

        var totalBatches = await _context.Batches
            .CountAsync(b => b.CoachingId == coachingId.Value && !b.IsDeleted);

        var activeBatches = await _context.Batches
            .CountAsync(b => b.CoachingId == coachingId.Value && b.IsActive && !b.IsDeleted);

        var totalEnrollments = await _context.Enrollments
            .CountAsync(e => e.CoachingId == coachingId.Value && e.Status == "Active");

        var recentEnrollments = await _context.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.User)
            .Include(e => e.Course)
            .Include(e => e.Batch)
            .Where(e => e.CoachingId == coachingId.Value)
            .OrderByDescending(e => e.EnrollmentDate)
            .Take(10)
            .Select(e => new
            {
                Id = e.Id,
                StudentName = $"{e.Student.User.FirstName} {e.Student.User.LastName}",
                CourseName = e.Course.Name,
                BatchName = e.Batch.Name,
                EnrollmentDate = e.EnrollmentDate,
                Status = e.Status
            })
            .ToListAsync();

        return Ok(new
        {
            Summary = new
            {
                TotalStudents = totalStudents,
                TotalTeachers = totalTeachers,
                TotalCourses = totalCourses,
                TotalBatches = totalBatches,
                ActiveBatches = activeBatches,
                TotalEnrollments = totalEnrollments
            },
            RecentEnrollments = recentEnrollments
        });
    }

    [HttpGet("teacher")]
    [Authorize(Roles = "Teacher")]
    public async Task<ActionResult> GetTeacherDashboard()
    {
        var coachingId = GetCoachingId();
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (coachingId == null)
            return Unauthorized();

        var teacher = await _context.Teachers
            .FirstOrDefaultAsync(t => t.CoachingId == coachingId.Value && t.UserId == userId && !t.IsDeleted);

        if (teacher == null)
            return NotFound(new { message = "Teacher not found" });

        var assignedBatches = await _context.Batches
            .Where(b => b.CoachingId == coachingId.Value && b.TeacherId == teacher.Id && b.IsActive && !b.IsDeleted)
            .Select(b => new
            {
                Id = b.Id,
                Name = b.Name,
                CurrentStudents = b.CurrentStudents,
                MaxStudents = b.MaxStudents,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                ScheduleDays = b.ScheduleDays
            })
            .ToListAsync();

        var today = DateTime.UtcNow.Date;
        var todayClasses = assignedBatches
            .Where(b => b.ScheduleDays != null && IsScheduledToday(b.ScheduleDays, today))
            .ToList();

        var totalStudents = await _context.Enrollments
            .Where(e => e.CoachingId == coachingId.Value && 
                       assignedBatches.Select(ab => ab.Id).Contains(e.BatchId) && 
                       e.Status == "Active")
            .CountAsync();

        return Ok(new
        {
            AssignedBatches = assignedBatches,
            TodayClasses = todayClasses,
            TotalStudents = totalStudents
        });
    }

    [HttpGet("student")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult> GetStudentDashboard()
    {
        var coachingId = GetCoachingId();
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (coachingId == null)
            return Unauthorized();

        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.CoachingId == coachingId.Value && s.UserId == userId && !s.IsDeleted);

        if (student == null)
            return NotFound(new { message = "Student not found" });

        var enrollments = await _context.Enrollments
            .Include(e => e.Course)
            .Include(e => e.Batch)
                .ThenInclude(b => b.Teacher)
                    .ThenInclude(t => t!.User)
            .Where(e => e.CoachingId == coachingId.Value && e.StudentId == student.Id && e.Status == "Active")
            .Select(e => new
            {
                Id = e.Id,
                CourseName = e.Course.Name,
                BatchName = e.Batch.Name,
                TeacherName = e.Batch.Teacher != null 
                    ? $"{e.Batch.Teacher.User.FirstName} {e.Batch.Teacher.User.LastName}" 
                    : null,
                EnrollmentDate = e.EnrollmentDate,
                BatchSchedule = new
                {
                    StartTime = e.Batch.StartTime,
                    EndTime = e.Batch.EndTime,
                    ScheduleDays = e.Batch.ScheduleDays
                }
            })
            .ToListAsync();

        // Get attendance summary
        var attendanceSummary = await _context.Attendances
            .Where(a => a.CoachingId == coachingId.Value && a.StudentId == student.Id && !a.IsDeleted)
            .GroupBy(a => a.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var totalAttendance = attendanceSummary.Sum(a => a.Count);
        var presentCount = attendanceSummary.FirstOrDefault(a => a.Status == "Present")?.Count ?? 0;
        var attendancePercentage = totalAttendance > 0 ? (presentCount * 100.0 / totalAttendance) : 0;

        // Get upcoming exams
        var upcomingExams = await _context.Exams
            .Include(e => e.Subject)
                .ThenInclude(s => s.Course)
            .Where(e => e.CoachingId == coachingId.Value && 
                       e.ExamDate >= DateTime.UtcNow.Date && 
                       e.IsActive && 
                       !e.IsDeleted)
            .OrderBy(e => e.ExamDate)
            .Take(5)
            .Select(e => new
            {
                Id = e.Id,
                Name = e.Name,
                SubjectName = e.Subject.Name,
                CourseName = e.Subject.Course.Name,
                ExamDate = e.ExamDate,
                StartTime = e.StartTime,
                EndTime = e.EndTime,
                TotalMarks = e.TotalMarks
            })
            .ToListAsync();

        return Ok(new
        {
            Enrollments = enrollments,
            AttendanceSummary = new
            {
                Total = totalAttendance,
                Present = presentCount,
                Percentage = Math.Round(attendancePercentage, 2)
            },
            UpcomingExams = upcomingExams
        });
    }

    private bool IsScheduledToday(string? scheduleDays, DateTime date)
    {
        if (string.IsNullOrEmpty(scheduleDays))
            return false;

        var dayOfWeek = date.DayOfWeek.ToString();
        return scheduleDays.Contains(dayOfWeek, StringComparison.OrdinalIgnoreCase);
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

