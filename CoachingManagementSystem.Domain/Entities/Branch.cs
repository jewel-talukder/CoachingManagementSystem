namespace CoachingManagementSystem.Domain.Entities;

public class Branch : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false; // First branch created is default
    
    // Navigation properties
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<Batch> Batches { get; set; } = new List<Batch>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}

