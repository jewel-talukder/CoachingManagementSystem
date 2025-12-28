namespace CoachingManagementSystem.Domain.Entities;

public class Specialization : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
}

