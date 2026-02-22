namespace CoachingManagementSystem.Domain.Entities;

public class Course : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public decimal? Fee { get; set; }
    public int DurationMonths { get; set; }
    public DateTime? StartDate { get; set; }
    public bool IsActive { get; set; } = true;
    
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    
    // Navigation properties
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}

