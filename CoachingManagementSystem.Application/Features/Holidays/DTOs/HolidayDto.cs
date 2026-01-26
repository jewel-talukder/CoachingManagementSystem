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
    public string? DaysOfWeek { get; set; } // JSON array string like "[0,6]" for multiple weekly off days
    public List<int>? DaysOfWeekList { get; set; } // Helper property for frontend (parsed from DaysOfWeek)
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
    public List<int>? DaysOfWeek { get; set; } // Required for WeeklyOff type - array of day numbers [0,6] for Sunday and Saturday
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
    public List<int>? DaysOfWeek { get; set; } // Array of day numbers [0,6] for weekly off
    public bool IsRecurring { get; set; }
    public bool IsActive { get; set; }
}

