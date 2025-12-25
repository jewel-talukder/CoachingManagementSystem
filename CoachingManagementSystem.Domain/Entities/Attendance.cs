namespace CoachingManagementSystem.Domain.Entities;

public class Attendance : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    
    public int BatchId { get; set; }
    public Batch Batch { get; set; } = null!;
    
    public DateTime AttendanceDate { get; set; }
    public string Status { get; set; } = "Present"; // Present, Absent, Late, Excused
    public string? Remarks { get; set; }
    public int? MarkedByUserId { get; set; }
    public User? MarkedByUser { get; set; }
}

