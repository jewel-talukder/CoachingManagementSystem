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
public class ExamsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ExamsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] int? subjectId, [FromQuery] bool? isActive)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var examsQuery = _context.Exams
            .Include(e => e.Subject)
                .ThenInclude(s => s.Course)
            .Include(e => e.Teacher)
                .ThenInclude(t => t!.User)
            .Where(e => e.CoachingId == coachingId.Value && !e.IsDeleted);

        if (subjectId.HasValue)
            examsQuery = examsQuery.Where(e => e.SubjectId == subjectId.Value);

        if (isActive.HasValue)
            examsQuery = examsQuery.Where(e => e.IsActive == isActive.Value);

        var exams = await examsQuery
            .Select(e => new
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description,
                ExamType = e.ExamType,
                SubjectId = e.SubjectId,
                SubjectName = e.Subject.Name,
                CourseName = e.Subject.Course.Name,
                TeacherId = e.TeacherId,
                TeacherName = e.Teacher != null ? $"{e.Teacher.User.FirstName} {e.Teacher.User.LastName}" : null,
                ExamDate = e.ExamDate,
                StartTime = e.StartTime,
                EndTime = e.EndTime,
                TotalMarks = e.TotalMarks,
                PassingMarks = e.PassingMarks,
                IsActive = e.IsActive
            })
            .OrderBy(e => e.ExamDate)
            .ToListAsync();

        return Ok(exams);
    }

    [HttpPost]
    [Authorize(Roles = "Teacher,Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreateExamRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Verify subject exists
        var subject = await _context.Subjects
            .FirstOrDefaultAsync(s => s.Id == request.SubjectId && s.CoachingId == coachingId.Value && !s.IsDeleted);

        if (subject == null)
            return NotFound(new { message = "Subject not found" });

        var exam = new Exam
        {
            CoachingId = coachingId.Value,
            SubjectId = request.SubjectId,
            TeacherId = request.TeacherId,
            Name = request.Name,
            Description = request.Description,
            ExamType = request.ExamType,
            ExamDate = request.ExamDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            TotalMarks = request.TotalMarks,
            PassingMarks = request.PassingMarks,
            IsActive = true
        };

        _context.Exams.Add(exam);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = exam.Id }, exam);
    }

    [HttpGet("{id}/results")]
    [Authorize(Roles = "Teacher,Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetExamResults(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var exam = await _context.Exams
            .FirstOrDefaultAsync(e => e.Id == id && e.CoachingId == coachingId.Value && !e.IsDeleted);

        if (exam == null)
            return NotFound(new { message = "Exam not found" });

        var results = await _context.Results
            .Include(r => r.Student)
                .ThenInclude(s => s.User)
            .Where(r => r.CoachingId == coachingId.Value && r.ExamId == id && !r.IsDeleted)
            .Select(r => new
            {
                Id = r.Id,
                StudentId = r.StudentId,
                StudentName = $"{r.Student.User.FirstName} {r.Student.User.LastName}",
                MarksObtained = r.MarksObtained,
                TotalMarks = r.TotalMarks,
                Grade = r.Grade,
                Remarks = r.Remarks,
                PublishedAt = r.PublishedAt
            })
            .ToListAsync();

        return Ok(new
        {
            Exam = new
            {
                Id = exam.Id,
                Name = exam.Name,
                TotalMarks = exam.TotalMarks,
                PassingMarks = exam.PassingMarks
            },
            Results = results
        });
    }

    [HttpPost("{id}/results")]
    [Authorize(Roles = "Teacher,Coaching Admin,Super Admin")]
    public async Task<ActionResult> UploadResults(int id, [FromBody] UploadResultsRequest request)
    {
        var coachingId = GetCoachingId();
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (coachingId == null)
            return Unauthorized();

        var exam = await _context.Exams
            .FirstOrDefaultAsync(e => e.Id == id && e.CoachingId == coachingId.Value && !e.IsDeleted);

        if (exam == null)
            return NotFound(new { message = "Exam not found" });

        var results = new List<Result>();

        foreach (var item in request.Results)
        {
            // Check if result already exists
            var existing = await _context.Results
                .FirstOrDefaultAsync(r => r.StudentId == item.StudentId && r.ExamId == id && !r.IsDeleted);

            var grade = CalculateGrade(item.MarksObtained, exam.TotalMarks, exam.PassingMarks);

            if (existing != null)
            {
                existing.MarksObtained = item.MarksObtained;
                existing.TotalMarks = exam.TotalMarks;
                existing.Grade = grade;
                existing.Remarks = item.Remarks;
                existing.PublishedAt = DateTime.UtcNow;
                existing.PublishedByUserId = userId;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var result = new Result
                {
                    CoachingId = coachingId.Value,
                    StudentId = item.StudentId,
                    ExamId = id,
                    MarksObtained = item.MarksObtained,
                    TotalMarks = exam.TotalMarks,
                    Grade = grade,
                    Remarks = item.Remarks,
                    PublishedAt = DateTime.UtcNow,
                    PublishedByUserId = userId
                };
                results.Add(result);
            }
        }

        if (results.Any())
        {
            _context.Results.AddRange(results);
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Results uploaded successfully" });
    }

    [HttpGet("student/{studentId}")]
    [Authorize]
    public async Task<ActionResult> GetStudentExams(int studentId)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var exams = await _context.Exams
            .Include(e => e.Subject)
                .ThenInclude(s => s.Course)
            .Where(e => e.CoachingId == coachingId.Value && e.IsActive && !e.IsDeleted)
            .Select(e => new
            {
                Id = e.Id,
                Name = e.Name,
                SubjectName = e.Subject.Name,
                CourseName = e.Subject.Course.Name,
                ExamType = e.ExamType,
                ExamDate = e.ExamDate,
                StartTime = e.StartTime,
                EndTime = e.EndTime,
                TotalMarks = e.TotalMarks,
                PassingMarks = e.PassingMarks,
                Result = _context.Results
                    .Where(r => r.StudentId == studentId && r.ExamId == e.Id && !r.IsDeleted)
                    .Select(r => new
                    {
                        MarksObtained = r.MarksObtained,
                        TotalMarks = r.TotalMarks,
                        Grade = r.Grade,
                        Remarks = r.Remarks
                    })
                    .FirstOrDefault()
            })
            .OrderBy(e => e.ExamDate)
            .ToListAsync();

        return Ok(exams);
    }

    private string CalculateGrade(decimal marksObtained, decimal totalMarks, decimal passingMarks)
    {
        var percentage = (marksObtained / totalMarks) * 100;

        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B+";
        if (percentage >= 60) return "B";
        if (percentage >= 50) return "C+";
        if (percentage >= passingMarks) return "C";
        return "F";
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

public class CreateExamRequest
{
    public int SubjectId { get; set; }
    public int? TeacherId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ExamType { get; set; } = "Regular";
    public DateTime ExamDate { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public decimal TotalMarks { get; set; }
    public decimal PassingMarks { get; set; }
}

public class UploadResultsRequest
{
    public List<ResultItem> Results { get; set; } = new();
}

public class ResultItem
{
    public int StudentId { get; set; }
    public decimal MarksObtained { get; set; }
    public string? Remarks { get; set; }
}

