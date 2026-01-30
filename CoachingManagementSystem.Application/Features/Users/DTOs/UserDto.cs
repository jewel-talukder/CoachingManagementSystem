namespace CoachingManagementSystem.Application.Features.Users.DTOs;

public class UserListDto
{
    public int Id { get; set; }
    public int? StudentId { get; set; }
    public int? TeacherId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public List<string> Roles { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? StudentCode { get; set; }
    public string? ParentName { get; set; }
    public string? ParentPhone { get; set; }
}

public class CreateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public List<int> RoleIds { get; set; } = new();
    public string UserType { get; set; } = string.Empty; // "Teacher" or "Student"
    public Dictionary<string, object>? AdditionalData { get; set; } // For Teacher/Student specific fields
}

public class UpdateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Password { get; set; } // Optional - only update if provided
    public bool IsActive { get; set; }
    public List<int> RoleIds { get; set; } = new();
    public string? UserType { get; set; } // "Teacher" or "Student"
    public Dictionary<string, object>? AdditionalData { get; set; } // For Teacher/Student specific fields
}

