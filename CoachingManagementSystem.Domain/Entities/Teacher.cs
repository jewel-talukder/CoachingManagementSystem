namespace CoachingManagementSystem.Domain.Entities;

public class Teacher : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string? EmployeeCode { get; set; }
    public string? Qualification { get; set; }
    public string? Specialization { get; set; }
    public DateTime? JoiningDate { get; set; }
    
    // Navigation properties
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<Batch> Batches { get; set; } = new List<Batch>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}

