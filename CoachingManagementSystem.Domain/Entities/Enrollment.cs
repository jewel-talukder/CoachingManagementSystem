namespace CoachingManagementSystem.Domain.Entities;

public class Enrollment : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    
    public int BatchId { get; set; }
    public Batch Batch { get; set; } = null!;
    
    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
    public DateTime? CompletionDate { get; set; }
    public string Status { get; set; } = "Active"; // Active, Completed, Cancelled
    public decimal? FeePaid { get; set; }
    public decimal? TotalFee { get; set; }
}

