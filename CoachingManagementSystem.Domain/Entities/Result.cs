namespace CoachingManagementSystem.Domain.Entities;

public class Result : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    
    public int ExamId { get; set; }
    public Exam Exam { get; set; } = null!;
    
    public decimal MarksObtained { get; set; }
    public decimal TotalMarks { get; set; }
    public string Grade { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public DateTime? PublishedAt { get; set; }
    public int? PublishedByUserId { get; set; }
    public User? PublishedByUser { get; set; }
}

