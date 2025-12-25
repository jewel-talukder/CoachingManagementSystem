namespace CoachingManagementSystem.Domain.Entities;

public class Plan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string BillingPeriod { get; set; } = "Monthly"; // Monthly, Yearly
    public int TrialDays { get; set; } = 0;
    
    // Limits
    public int? MaxUsers { get; set; }
    public int? MaxCourses { get; set; }
    public int? MaxStudents { get; set; }
    public int? MaxTeachers { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public ICollection<Coaching> Coachings { get; set; } = new List<Coaching>();
}

