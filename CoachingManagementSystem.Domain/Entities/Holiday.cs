namespace CoachingManagementSystem.Domain.Entities;

public class Holiday : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int? BranchId { get; set; } // Null means holiday applies to all branches
    public Branch? Branch { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Holiday Type: "SingleDay", "DateRange", "WeeklyOff", "Government", "Religious"
    public string HolidayType { get; set; } = "SingleDay";
    
    // For single day or start date of range
    public DateTime StartDate { get; set; }
    
    // For date range holidays (null for single day)
    public DateTime? EndDate { get; set; }
    
    // For weekly off days (DayOfWeek: 0=Sunday, 1=Monday, ..., 6=Saturday)
    public int? DayOfWeek { get; set; } // Null if not a weekly off
    
    // If true, holiday repeats every year (for date-based holidays)
    public bool IsRecurring { get; set; } = false;
    
    public bool IsActive { get; set; } = true;
}

