using CoachingManagementSystem.Application.DTOs.Auth;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace CoachingManagementSystem.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthService(IApplicationDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Coaching)
            .FirstOrDefaultAsync(u => u.Email == request.Email && !u.IsDeleted);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("User account is inactive");
        }

        if (!user.Coaching.IsActive || user.Coaching.IsBlocked)
        {
            throw new UnauthorizedAccessException("Coaching account is inactive or blocked");
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var token = _jwtService.GenerateToken(user, roles, user.CoachingId);
        var refreshToken = _jwtService.GenerateRefreshToken();

        return new LoginResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = user.Id,
                CoachingId = user.CoachingId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone,
                Roles = roles
            },
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };
    }

    public async Task<LoginResponse> RegisterCoachingAsync(RegisterCoachingRequest request)
    {
        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.AdminEmail))
        {
            throw new InvalidOperationException("Email already exists");
        }

        // Create coaching
        var coaching = new Coaching
        {
            Name = request.CoachingName,
            Address = request.Address,
            City = request.City,
            State = request.State,
            ZipCode = request.ZipCode,
            Country = request.Country,
            Phone = request.Phone,
            Email = request.Email,
            IsActive = true,
            IsBlocked = false
        };

        _context.Coachings.Add(coaching);
        await _context.SaveChangesAsync();

        // Get Coaching Admin role
        var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Coaching Admin");
        if (adminRole == null)
        {
            adminRole = new Role { Name = "Coaching Admin", Description = "Coaching Administrator" };
            _context.Roles.Add(adminRole);
            await _context.SaveChangesAsync();
        }

        // Create admin user
        var adminUser = new User
        {
            CoachingId = coaching.Id,
            FirstName = request.AdminFirstName,
            LastName = request.AdminLastName,
            Email = request.AdminEmail,
            Phone = request.AdminPhone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.AdminPassword),
            IsActive = true
        };

        _context.Users.Add(adminUser);
        await _context.SaveChangesAsync();

        // Assign role
        var userRole = new UserRole
        {
            UserId = adminUser.Id,
            RoleId = adminRole.Id
        };

        _context.UserRoles.Add(userRole);
        await _context.SaveChangesAsync();

        // Generate token
        var roles = new List<string> { adminRole.Name };
        var token = _jwtService.GenerateToken(adminUser, roles, coaching.Id);
        var refreshToken = _jwtService.GenerateRefreshToken();

        return new LoginResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = adminUser.Id,
                CoachingId = coaching.Id,
                FirstName = adminUser.FirstName,
                LastName = adminUser.LastName,
                Email = adminUser.Email,
                Phone = adminUser.Phone,
                Roles = roles
            },
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        var principal = _jwtService.GetPrincipalFromToken(token);
        return principal != null;
    }
}

