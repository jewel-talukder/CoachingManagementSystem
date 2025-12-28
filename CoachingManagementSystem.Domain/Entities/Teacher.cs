using CoachingManagementSystem.Domain.Enums;

namespace CoachingManagementSystem.Domain.Entities;

public class Teacher : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string? EmployeeCode { get; set; }
    public int? QualificationId { get; set; }
    public Qualification? Qualification { get; set; }
    public int? SpecializationId { get; set; }
    public Specialization? Specialization { get; set; }
    public DateTime? JoiningDate { get; set; }
    public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
    public decimal? Salary { get; set; }
    
    // Navigation properties
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<Batch> Batches { get; set; } = new List<Batch>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}

