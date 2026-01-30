using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using CoachingManagementSystem.Infrastructure.Data;
using CoachingManagementSystem.Infrastructure.Services;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Application.Services;

namespace CoachingManagementSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
        
        // Register DbContext as interface
        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        // Services
        services.AddScoped<ITenantService, TenantService>();
        services.AddHttpContextAccessor();

        // Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtService, JwtService>();

        // Payment Services
        services.AddHttpClient();
        services.AddScoped<IPaymentService, SslPaymentService>();

        // Email Service
        services.AddScoped<IEmailService, EmailService>();

        // SMS Service
        services.AddScoped<ISmsService, SmsService>();

        // CQRS Handlers
        services.AddScoped<CoachingManagementSystem.Application.Features.Courses.Commands.CreateCourseCommandHandler>();
        services.AddScoped<CoachingManagementSystem.Application.Features.Courses.Queries.GetAllCoursesQueryHandler>();

        return services;
    }
}

