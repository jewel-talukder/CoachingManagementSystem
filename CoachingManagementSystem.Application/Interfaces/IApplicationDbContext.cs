using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Coaching> Coachings { get; }
    DbSet<Branch> Branches { get; }
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<Student> Students { get; }
    DbSet<Teacher> Teachers { get; }
    DbSet<Course> Courses { get; }
    DbSet<Subject> Subjects { get; }
    DbSet<Batch> Batches { get; }
    DbSet<Enrollment> Enrollments { get; }
    DbSet<Attendance> Attendances { get; }
    DbSet<Exam> Exams { get; }
    DbSet<Result> Results { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Plan> Plans { get; }
    DbSet<Subscription> Subscriptions { get; }
    DbSet<UsageLog> UsageLogs { get; }
    DbSet<Qualification> Qualifications { get; }
    DbSet<Specialization> Specializations { get; }
    DbSet<Holiday> Holidays { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<IDbContextTransaction> BeginTransactionAsync();
}

