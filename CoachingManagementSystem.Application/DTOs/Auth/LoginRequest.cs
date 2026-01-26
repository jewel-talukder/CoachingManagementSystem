namespace CoachingManagementSystem.Application.DTOs.Auth;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty; // Can be email or phone
    public string Password { get; set; } = string.Empty;
}

