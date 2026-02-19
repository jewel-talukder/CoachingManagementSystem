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
        // Support login with email or phone number (username)
        // Check if request has Username (phone) or Email
        var loginIdentifier = !string.IsNullOrWhiteSpace(request.Username) 
            ? request.Username 
            : request.Email;

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .Include(u => u.Coaching)
            .FirstOrDefaultAsync(u => 
                (u.Email == loginIdentifier || u.Phone == loginIdentifier) && !u.IsDeleted);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid username/email or password");
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
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Where(rp => !rp.IsDeleted && !rp.Permission.IsDeleted)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

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
                Email = user.Email ?? string.Empty,
                Phone = user.Phone,
                Roles = roles,
                Permissions = permissions
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

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
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

            // Create default branch with coaching name
            var defaultBranch = new Branch
            {
                CoachingId = coaching.Id,
                Name = request.CoachingName, // Use coaching name as branch name
                Code = "MAIN", // Default code
                Address = request.Address,
                City = request.City,
                State = request.State,
                ZipCode = request.ZipCode,
                Country = request.Country,
                Phone = request.Phone,
                Email = request.Email,
                IsActive = true,
                IsDefault = true
            };

            _context.Branches.Add(defaultBranch);
            await _context.SaveChangesAsync();

            // Get Coaching Admin role
            var adminRole = await _context.Roles.FirstOrDefaultAsync(u => u.Name == "Coaching Admin");
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

            // Get the first active plan matching the selected billing period
            var firstPlan = await _context.Plans
                .Where(p => p.IsActive && !p.IsDeleted && p.BillingPeriod == request.BillingPeriod)
                .OrderBy(p => p.Id)
                .FirstOrDefaultAsync();
            
            // If no plan found for selected billing period, fallback to Monthly
            if (firstPlan == null && request.BillingPeriod != "Monthly")
            {
                firstPlan = await _context.Plans
                    .Where(p => p.IsActive && !p.IsDeleted && p.BillingPeriod == "Monthly")
                    .OrderBy(p => p.Id)
                    .FirstOrDefaultAsync();
            }

            PlanDto? planDto = null;
            if (firstPlan != null)
            {
                // Create subscription for the new coaching with the first plan
                var startDate = DateTime.UtcNow;
                DateTime endDate;
                if (firstPlan.TrialDays > 0)
                {
                    endDate = startDate.AddDays(firstPlan.TrialDays);
                }
                else
                {
                    // Calculate end date based on billing period
                    endDate = firstPlan.BillingPeriod == "Yearly" 
                        ? startDate.AddYears(1) 
                        : startDate.AddMonths(1);
                }
                DateTime? trialEndDate = firstPlan.TrialDays > 0 ? endDate : null;

                var subscription = new Subscription
                {
                    CoachingId = coaching.Id,
                    PlanId = firstPlan.Id,
                    StartDate = startDate,
                    EndDate = endDate,
                    TrialEndDate = trialEndDate,
                    Status = firstPlan.TrialDays > 0 ? "Trial" : "Active",
                    Amount = firstPlan.Price,
                    AutoRenew = false
                };

                _context.Subscriptions.Add(subscription);
                await _context.SaveChangesAsync();

                // Update coaching with subscription
                coaching.SubscriptionId = subscription.Id;
                coaching.PlanId = firstPlan.Id;
                coaching.SubscriptionExpiresAt = endDate;
                await _context.SaveChangesAsync();

                // Map plan to DTO
                planDto = new PlanDto
                {
                    Id = firstPlan.Id,
                    Name = firstPlan.Name,
                    Description = firstPlan.Description,
                    Price = firstPlan.Price,
                    BillingPeriod = firstPlan.BillingPeriod,
                    TrialDays = firstPlan.TrialDays,
                    MaxUsers = firstPlan.MaxUsers,
                    MaxCourses = firstPlan.MaxCourses,
                    MaxStudents = firstPlan.MaxStudents,
                    MaxTeachers = firstPlan.MaxTeachers
                };
            }

            await transaction.CommitAsync();

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
                ExpiresAt = DateTime.UtcNow.AddHours(24),
                Plan = planDto
            };
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        var principal = _jwtService.GetPrincipalFromToken(token);
        return principal != null;
    }
}

