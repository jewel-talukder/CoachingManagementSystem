namespace CoachingManagementSystem.Domain.Entities;

public class Exam : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ExamType { get; set; } = "Regular"; // Regular, MidTerm, Final
    public DateTime ExamDate { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public decimal TotalMarks { get; set; }
    public decimal PassingMarks { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<Result> Results { get; set; } = new List<Result>();
}

