

namespace CoachingManagementSystem.Domain.Entities;

public class Shift : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;

    public string Name { get; set; } = string.Empty; // e.g., "Morning Shift"
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int GraceTimeMinutes { get; set; } = 15; // Time allowed before marked Late

    public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
}
