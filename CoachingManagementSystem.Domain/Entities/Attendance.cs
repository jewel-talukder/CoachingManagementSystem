namespace CoachingManagementSystem.Domain.Entities;

public class Attendance : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int? StudentId { get; set; }
    public Student? Student { get; set; }
    
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    
    public int? BatchId { get; set; }
    public Batch? Batch { get; set; }
    
    public DateTime AttendanceDate { get; set; }
    public string Status { get; set; } = "Present"; // Present, Absent, Late, Excused
    public string AttendanceType { get; set; } = "Student"; // Student, Teacher
    public bool IsApproved { get; set; } = true;
    public int? ApprovedByUserId { get; set; }
    public User? ApprovedByUser { get; set; }
    public string? Remarks { get; set; }
    public int? MarkedByUserId { get; set; }
    public User? MarkedByUser { get; set; }
}

