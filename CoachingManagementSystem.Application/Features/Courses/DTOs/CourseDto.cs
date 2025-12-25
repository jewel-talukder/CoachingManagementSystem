namespace CoachingManagementSystem.Application.Features.Courses.DTOs;

public class CourseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public decimal? Fee { get; set; }
    public int DurationMonths { get; set; }
    public bool IsActive { get; set; }
    public int? TeacherId { get; set; }
    public string? TeacherName { get; set; }
    public int SubjectCount { get; set; }
    public int EnrollmentCount { get; set; }
}

public class CreateCourseRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public decimal? Fee { get; set; }
    public int DurationMonths { get; set; }
    public int? TeacherId { get; set; }
}

public class UpdateCourseRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public decimal? Fee { get; set; }
    public int DurationMonths { get; set; }
    public bool IsActive { get; set; }
    public int? TeacherId { get; set; }
}

