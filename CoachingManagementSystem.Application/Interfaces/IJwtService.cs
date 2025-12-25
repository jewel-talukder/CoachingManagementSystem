using System.Security.Claims;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user, List<string> roles, int coachingId);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromToken(string token);
}

