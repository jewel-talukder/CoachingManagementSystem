
namespace CoachingManagementSystem.Application.Features.Shifts.DTOs;

public class ShiftDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty; // Format: "hh:mm tt"
    public string EndTime { get; set; } = string.Empty;   // Format: "hh:mm tt"
    public int GraceTimeMinutes { get; set; }
}

public class CreateShiftRequest
{
    public string Name { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty; // User input "HH:mm"
    public string EndTime { get; set; } = string.Empty;   // User input "HH:mm"
    public int GraceTimeMinutes { get; set; }
}

public class UpdateShiftRequest
{
    public string Name { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int GraceTimeMinutes { get; set; }
}
