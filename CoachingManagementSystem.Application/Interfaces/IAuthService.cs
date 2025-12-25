using CoachingManagementSystem.Application.DTOs.Auth;

namespace CoachingManagementSystem.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> RegisterCoachingAsync(RegisterCoachingRequest request);
    Task<bool> ValidateTokenAsync(string token);
}

