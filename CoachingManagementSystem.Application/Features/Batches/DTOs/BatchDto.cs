using System.Text.Json.Serialization;

namespace CoachingManagementSystem.Application.Features.Batches.DTOs;

public class DaySchedule
{
    public string Day { get; set; } = string.Empty; // Monday, Tuesday, Wednesday, etc.
    public string StartTime { get; set; } = string.Empty; // Format: "HH:mm:ss" or "HH:mm"
    public string EndTime { get; set; } = string.Empty; // Format: "HH:mm:ss" or "HH:mm"
}

public class BatchDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
    public int? TeacherId { get; set; }
    public string? TeacherName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int MaxStudents { get; set; }
    public int CurrentStudents { get; set; }
    public decimal MonthlyFee { get; set; }
    public string? ScheduleDays { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public bool IsActive { get; set; }
}

public class CreateBatchRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
    public int? TeacherId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int MaxStudents { get; set; }
    public decimal MonthlyFee { get; set; }
    public string? ScheduleDays { get; set; } // JSON string of DaySchedule array
    // Legacy fields for backward compatibility
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    // Helper property for frontend (not stored directly)
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<DaySchedule>? DaySchedules { get; set; }
}

public class UpdateBatchRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
    public int? TeacherId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxStudents { get; set; }
    public decimal? MonthlyFee { get; set; }
    public string? ScheduleDays { get; set; } // JSON string of DaySchedule array
    // Legacy fields for backward compatibility
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public bool IsActive { get; set; }
    // Helper property for frontend (not stored directly)
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<DaySchedule>? DaySchedules { get; set; }
}

