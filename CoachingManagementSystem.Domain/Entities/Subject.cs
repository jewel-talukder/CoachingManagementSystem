namespace CoachingManagementSystem.Domain.Entities;

public class Subject : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    
    // Navigation properties
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}

