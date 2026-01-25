namespace CoachingManagementSystem.Domain.Entities;

public class Batch : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int MaxStudents { get; set; }
    public int CurrentStudents { get; set; } = 0;
    public decimal MonthlyFee { get; set; } // Monthly fee for this batch
    
    // Schedule - JSON format: [{"day": "Monday", "startTime": "09:00:00", "endTime": "10:00:00"}, ...]
    public string? ScheduleDays { get; set; } // JSON array of day schedules with times
    // Legacy fields kept for backward compatibility (deprecated, use ScheduleDays instead)
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}

