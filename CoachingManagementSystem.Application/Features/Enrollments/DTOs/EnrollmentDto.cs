namespace CoachingManagementSystem.Application.Features.Enrollments.DTOs;

public class EnrollmentDto
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public int BatchId { get; set; }
    public string BatchName { get; set; } = string.Empty;
    public DateTime EnrollmentDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string EnrollmentType { get; set; } = string.Empty;
    public decimal? FeePaid { get; set; }
    public decimal? TotalFee { get; set; }
}

public class CreateEnrollmentRequest
{
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public int BatchId { get; set; }
    public string EnrollmentType { get; set; } = "CourseWise";
    public decimal? FeePaid { get; set; }
    public decimal? TotalFee { get; set; }
}

public class UpdateEnrollmentRequest
{
    public int? StudentId { get; set; }
    public int? CourseId { get; set; }
    public int? BatchId { get; set; }
    public string? Status { get; set; }
    public string? EnrollmentType { get; set; }
    public decimal? FeePaid { get; set; }
    public decimal? TotalFee { get; set; }
}

