using CoachingManagementSystem.Domain.Enums;

namespace CoachingManagementSystem.Application.Features.Teachers.DTOs;

public class TeacherDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public int? QualificationId { get; set; }
    public string? QualificationName { get; set; }
    public int? SpecializationId { get; set; }
    public string? SpecializationName { get; set; }
    public DateTime? JoiningDate { get; set; }
    public EmploymentType EmploymentType { get; set; }
    public decimal? Salary { get; set; }
    public bool IsActive { get; set; }
}

public class CreateTeacherRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public int BranchId { get; set; }
    public string? EmployeeCode { get; set; }
    public int? QualificationId { get; set; }
    public int? SpecializationId { get; set; }
    public DateTime? JoiningDate { get; set; }
    public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
    public decimal? Salary { get; set; }
}

public class UpdateTeacherRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? BranchId { get; set; }
    public string? EmployeeCode { get; set; }
    public int? QualificationId { get; set; }
    public int? SpecializationId { get; set; }
    public DateTime? JoiningDate { get; set; }
    public EmploymentType? EmploymentType { get; set; }
    public decimal? Salary { get; set; }
    public bool? IsActive { get; set; }
}

