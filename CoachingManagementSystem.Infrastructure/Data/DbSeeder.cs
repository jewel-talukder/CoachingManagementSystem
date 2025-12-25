using CoachingManagementSystem.Domain.Entities;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace CoachingManagementSystem.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedRolesAsync(ApplicationDbContext context)
    {
        if (context.Roles.Any())
            return;

        var roles = new[]
        {
            new Role { Name = "Super Admin", Description = "SaaS Owner - Full system access" },
            new Role { Name = "Coaching Admin", Description = "Coaching Administrator - Manage coaching operations" },
            new Role { Name = "Teacher", Description = "Teacher - Manage classes, attendance, exams" },
            new Role { Name = "Student", Description = "Student - View courses, attendance, results" }
        };

        context.Roles.AddRange(roles);
        await context.SaveChangesAsync();
    }

    public static async Task SeedPlansAsync(ApplicationDbContext context)
    {
        if (context.Plans.Any())
            return;

        var plans = new[]
        {
            new Plan
            {
                Name = "Free Trial",
                Description = "14 days free trial",
                Price = 0,
                BillingPeriod = "Monthly",
                TrialDays = 14,
                MaxUsers = 5,
                MaxCourses = 3,
                MaxStudents = 50,
                MaxTeachers = 5,
                IsActive = true
            },
            new Plan
            {
                Name = "Basic",
                Description = "Basic plan for small coachings",
                Price = 29.99m,
                BillingPeriod = "Monthly",
                TrialDays = 0,
                MaxUsers = 20,
                MaxCourses = 10,
                MaxStudents = 200,
                MaxTeachers = 20,
                IsActive = true
            },
            new Plan
            {
                Name = "Professional",
                Description = "Professional plan for growing coachings",
                Price = 79.99m,
                BillingPeriod = "Monthly",
                TrialDays = 0,
                MaxUsers = 100,
                MaxCourses = 50,
                MaxStudents = 1000,
                MaxTeachers = 100,
                IsActive = true
            },
            new Plan
            {
                Name = "Enterprise",
                Description = "Enterprise plan with unlimited features",
                Price = 199.99m,
                BillingPeriod = "Monthly",
                TrialDays = 0,
                MaxUsers = null,
                MaxCourses = null,
                MaxStudents = null,
                MaxTeachers = null,
                IsActive = true
            }
        };

        context.Plans.AddRange(plans);
        await context.SaveChangesAsync();
    }

    public static async Task SeedMainAdminAsync(ApplicationDbContext context)
    {
        // Check if main admin already exists
        var existingAdmin = await context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserRoles.Any(ur => ur.Role.Name == "Super Admin") && !u.IsDeleted);

        if (existingAdmin != null)
            return;

        // Ensure roles are seeded first
        await SeedRolesAsync(context);

        // Get Super Admin role
        var superAdminRole = await context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Super Admin" && !r.IsDeleted);

        if (superAdminRole == null)
            throw new InvalidOperationException("Super Admin role not found. Please seed roles first.");

        // Create or get main system coaching
        var mainCoaching = await context.Coachings
            .FirstOrDefaultAsync(c => c.Name == "System Main" && !c.IsDeleted);

        if (mainCoaching == null)
        {
            mainCoaching = new Coaching
            {
                Name = "System Main",
                Email = "admin@coachingmanagement.com",
                Address = "System Headquarters",
                City = "System",
                State = "System",
                Country = "System",
                IsActive = true,
                IsBlocked = false
            };
            context.Coachings.Add(mainCoaching);
            await context.SaveChangesAsync();
        }

        // Create Super Admin user
        var superAdminUser = new User
        {
            CoachingId = mainCoaching.Id,
            FirstName = "Super",
            LastName = "Admin",
            Email = "superadmin@coachingmanagement.com",
            Phone = "+1234567890",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            IsActive = true
        };

        context.Users.Add(superAdminUser);
        await context.SaveChangesAsync();

        // Assign Super Admin role
        var userRole = new UserRole
        {
            UserId = superAdminUser.Id,
            RoleId = superAdminRole.Id
        };

        context.UserRoles.Add(userRole);
        await context.SaveChangesAsync();
    }
}

