namespace CoachingManagementSystem.Application.DTOs.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public PlanDto? Plan { get; set; }
}

public class UserDto
{
    public int Id { get; set; }
    public int CoachingId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}

public class PlanDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string BillingPeriod { get; set; } = string.Empty;
    public int TrialDays { get; set; }
    public int? MaxUsers { get; set; }
    public int? MaxCourses { get; set; }
    public int? MaxStudents { get; set; }
    public int? MaxTeachers { get; set; }
}

