namespace CoachingManagementSystem.Domain.Entities;

public class UsageLog : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public int? UserId { get; set; }
    public User? User { get; set; }
    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
}

