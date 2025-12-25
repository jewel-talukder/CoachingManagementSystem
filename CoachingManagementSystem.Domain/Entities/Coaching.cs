namespace CoachingManagementSystem.Domain.Entities;

public class Coaching : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsBlocked { get; set; } = false;
    
    // Subscription related
    public int? SubscriptionId { get; set; }
    public Subscription? Subscription { get; set; }
    public DateTime? SubscriptionExpiresAt { get; set; }
    public int? PlanId { get; set; }
    public Plan? Plan { get; set; }
    
    // Navigation properties
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<Batch> Batches { get; set; } = new List<Batch>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
}

