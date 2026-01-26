namespace CoachingManagementSystem.Application.Features.Holidays.DTOs;

public class HolidayDto
{
    public int Id { get; set; }
    public int CoachingId { get; set; }
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string HolidayType { get; set; } = "SingleDay"; // "SingleDay", "DateRange", "WeeklyOff", "Government", "Religious"
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? DayOfWeek { get; set; } // For weekly off: 0=Sunday, 1=Monday, ..., 6=Saturday
    public bool IsRecurring { get; set; }
    public bool IsActive { get; set; }
}

public class CreateHolidayRequest
{
    public int? BranchId { get; set; } // Null means all branches
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string HolidayType { get; set; } = "SingleDay"; // "SingleDay", "DateRange", "WeeklyOff", "Government", "Religious"
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; } // Required for DateRange type
    public int? DayOfWeek { get; set; } // Required for WeeklyOff type (0=Sunday, 1=Monday, ..., 6=Saturday)
    public bool IsRecurring { get; set; } = false; // For yearly recurring holidays
}

public class UpdateHolidayRequest
{
    public int? BranchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string HolidayType { get; set; } = "SingleDay";
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? DayOfWeek { get; set; }
    public bool IsRecurring { get; set; }
    public bool IsActive { get; set; }
}

