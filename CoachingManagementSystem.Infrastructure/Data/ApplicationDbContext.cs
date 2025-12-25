using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Domain.Entities;
using CoachingManagementSystem.Application.Interfaces;

namespace CoachingManagementSystem.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Coaching> Coachings { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Teacher> Teachers { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Batch> Batches { get; set; }
    public DbSet<Enrollment> Enrollments { get; set; }
    public DbSet<Attendance> Attendances { get; set; }
    public DbSet<Exam> Exams { get; set; }
    public DbSet<Result> Results { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Plan> Plans { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<UsageLog> UsageLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure indexes for multi-tenancy
        modelBuilder.Entity<User>().HasIndex(u => new { u.CoachingId, u.Email }).IsUnique();
        modelBuilder.Entity<Student>().HasIndex(s => new { s.CoachingId, s.StudentCode }).IsUnique();
        modelBuilder.Entity<Teacher>().HasIndex(t => new { t.CoachingId, t.EmployeeCode }).IsUnique();
        modelBuilder.Entity<Course>().HasIndex(c => new { c.CoachingId, c.Code }).IsUnique();
        modelBuilder.Entity<Batch>().HasIndex(b => new { b.CoachingId, b.Code }).IsUnique();

        // Configure relationships
        modelBuilder.Entity<User>()
            .HasOne(u => u.Coaching)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Student>()
            .HasOne(s => s.User)
            .WithOne(u => u.Student)
            .HasForeignKey<Student>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Teacher>()
            .HasOne(t => t.User)
            .WithOne(u => u.Teacher)
            .HasForeignKey<Teacher>(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Subscription relationship (one-to-one)
        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Coaching)
            .WithOne(c => c.Subscription)
            .HasForeignKey<Subscription>(s => s.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Coaching>()
            .HasOne(c => c.Plan)
            .WithMany(p => p.Coachings)
            .HasForeignKey(c => c.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Course relationships to avoid cascade conflicts
        modelBuilder.Entity<Course>()
            .HasOne(c => c.Coaching)
            .WithMany(co => co.Courses)
            .HasForeignKey(c => c.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Batch relationships to avoid cascade conflicts
        modelBuilder.Entity<Batch>()
            .HasOne(b => b.Coaching)
            .WithMany(c => c.Batches)
            .HasForeignKey(b => b.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Batch>()
            .HasOne(b => b.Course)
            .WithMany(c => c.Batches)
            .HasForeignKey(b => b.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure other relationships
        modelBuilder.Entity<Subject>()
            .HasOne(s => s.Coaching)
            .WithMany()
            .HasForeignKey(s => s.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Subject>()
            .HasOne(s => s.Course)
            .WithMany(c => c.Subjects)
            .HasForeignKey(s => s.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Coaching)
            .WithMany()
            .HasForeignKey(e => e.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Batch)
            .WithMany(b => b.Enrollments)
            .HasForeignKey(e => e.BatchId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Student)
            .WithMany(s => s.Enrollments)
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.Coaching)
            .WithMany()
            .HasForeignKey(a => a.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.Batch)
            .WithMany(b => b.Attendances)
            .HasForeignKey(a => a.BatchId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.Student)
            .WithMany(s => s.Attendances)
            .HasForeignKey(a => a.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Exam>()
            .HasOne(e => e.Coaching)
            .WithMany()
            .HasForeignKey(e => e.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Exam>()
            .HasOne(e => e.Subject)
            .WithMany(s => s.Exams)
            .HasForeignKey(e => e.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Result>()
            .HasOne(r => r.Coaching)
            .WithMany()
            .HasForeignKey(r => r.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Result>()
            .HasOne(r => r.Exam)
            .WithMany(e => e.Results)
            .HasForeignKey(r => r.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Result>()
            .HasOne(r => r.Student)
            .WithMany(s => s.Results)
            .HasForeignKey(r => r.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Coaching)
            .WithMany()
            .HasForeignKey(p => p.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Student)
            .WithMany(s => s.Payments)
            .HasForeignKey(p => p.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UsageLog>()
            .HasOne(u => u.Coaching)
            .WithMany()
            .HasForeignKey(u => u.CoachingId)
            .OnDelete(DeleteBehavior.Restrict);

        // Soft delete filter
        modelBuilder.Entity<Coaching>().HasQueryFilter(c => !c.IsDeleted);
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Student>().HasQueryFilter(s => !s.IsDeleted);
        modelBuilder.Entity<Teacher>().HasQueryFilter(t => !t.IsDeleted);
        modelBuilder.Entity<Course>().HasQueryFilter(c => !c.IsDeleted);
        modelBuilder.Entity<Batch>().HasQueryFilter(b => !b.IsDeleted);
        modelBuilder.Entity<Exam>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Plan>().HasQueryFilter(p => !p.IsDeleted);
    }
}

