using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Application.Features.Teachers.DTOs;
using CoachingManagementSystem.Domain.Entities;
using BCrypt.Net;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeachersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public TeachersController(IApplicationDbContext context)
    {
        _context = context;
    }

    private int? GetCoachingId()
    {
        var coachingIdClaim = User.FindFirst("coachingId");
        if (coachingIdClaim != null && int.TryParse(coachingIdClaim.Value, out var coachingId))
        {
            return coachingId;
        }
        return null;
    }

    [HttpGet]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetAll([FromQuery] int? branchId, [FromQuery] bool? isActive)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var teachersQuery = _context.Teachers
            .Include(t => t.User)
            .Include(t => t.Branch)
            .Include(t => t.Qualification)
            .Include(t => t.Specialization)
            .Where(t => t.CoachingId == coachingId.Value && !t.IsDeleted && t.User != null && !t.User.IsDeleted);

        if (branchId.HasValue)
            teachersQuery = teachersQuery.Where(t => t.BranchId == branchId.Value);

        if (isActive.HasValue)
            teachersQuery = teachersQuery.Where(t => t.User.IsActive == isActive.Value);

        var teachers = await teachersQuery
            .Select(t => new TeacherDto
            {
                Id = t.Id,
                UserId = t.UserId,
                FirstName = t.User.FirstName,
                LastName = t.User.LastName,
                Email = t.User.Email,
                Phone = t.User.Phone,
                BranchId = t.BranchId,
                BranchName = t.Branch != null ? t.Branch.Name : string.Empty,
                EmployeeCode = t.EmployeeCode,
                QualificationId = t.QualificationId,
                QualificationName = t.Qualification != null ? t.Qualification.Name : null,
                SpecializationId = t.SpecializationId,
                SpecializationName = t.Specialization != null ? t.Specialization.Name : null,
                JoiningDate = t.JoiningDate,
                EmploymentType = t.EmploymentType,
                Salary = t.Salary,
                IsActive = t.User.IsActive
            })
            .ToListAsync();

        return Ok(teachers);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<TeacherDto>> GetById(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var teacher = await _context.Teachers
            .Include(t => t.User)
            .Include(t => t.Branch)
            .Include(t => t.Qualification)
            .Include(t => t.Specialization)
            .FirstOrDefaultAsync(t => t.Id == id && t.CoachingId == coachingId.Value && !t.IsDeleted && !t.User.IsDeleted);

        if (teacher == null)
            return NotFound(new { message = "Teacher not found" });

        return Ok(new TeacherDto
        {
            Id = teacher.Id,
            UserId = teacher.UserId,
            FirstName = teacher.User.FirstName,
            LastName = teacher.User.LastName,
            Email = teacher.User.Email,
            Phone = teacher.User.Phone,
            BranchId = teacher.BranchId,
            BranchName = teacher.Branch != null ? teacher.Branch.Name : string.Empty,
            EmployeeCode = teacher.EmployeeCode,
            QualificationId = teacher.QualificationId,
            QualificationName = teacher.Qualification != null ? teacher.Qualification.Name : null,
            SpecializationId = teacher.SpecializationId,
            SpecializationName = teacher.Specialization != null ? teacher.Specialization.Name : null,
            JoiningDate = teacher.JoiningDate,
            EmploymentType = teacher.EmploymentType,
            Salary = teacher.Salary,
            IsActive = teacher.User.IsActive
        });
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreateTeacherRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Validate branch
        int branchId = request.BranchId;
        if (branchId == 0)
        {
            var defaultBranch = await _context.Branches
                .FirstOrDefaultAsync(b => b.CoachingId == coachingId.Value && b.IsDefault && !b.IsDeleted);
            if (defaultBranch != null)
                branchId = defaultBranch.Id;
        }

        if (branchId == 0)
            return BadRequest(new { message = "Branch is required" });

        var branch = await _context.Branches
            .FirstOrDefaultAsync(b => b.Id == branchId && b.CoachingId == coachingId.Value && !b.IsDeleted);
        if (branch == null)
            return BadRequest(new { message = "Branch not found" });

        // Check if email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.CoachingId == coachingId.Value && !u.IsDeleted);
        if (existingUser != null)
            return BadRequest(new { message = "Email already exists" });

        // Get Teacher role
        var teacherRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Teacher");
        if (teacherRole == null)
            return BadRequest(new { message = "Teacher role not found" });

        // Create user
        var user = new User
        {
            CoachingId = coachingId.Value,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Assign Teacher role
        var userRole = new UserRole
        {
            UserId = user.Id,
            RoleId = teacherRole.Id
        };
        _context.UserRoles.Add(userRole);

        // Validate qualification if provided
        int? qualificationId = null;
        if (request.QualificationId.HasValue && request.QualificationId.Value > 0)
        {
            var qualification = await _context.Qualifications
                .FirstOrDefaultAsync(q => q.Id == request.QualificationId.Value && 
                                         q.CoachingId == coachingId.Value && 
                                         !q.IsDeleted);
            if (qualification == null)
                return BadRequest(new { message = "Qualification not found" });
            qualificationId = qualification.Id;
        }

        // Validate specialization if provided
        int? specializationId = null;
        if (request.SpecializationId.HasValue && request.SpecializationId.Value > 0)
        {
            var specialization = await _context.Specializations
                .FirstOrDefaultAsync(s => s.Id == request.SpecializationId.Value && 
                                         s.CoachingId == coachingId.Value && 
                                         !s.IsDeleted);
            if (specialization == null)
                return BadRequest(new { message = "Specialization not found" });
            specializationId = specialization.Id;
        }

        // Create teacher record
        var teacher = new Teacher
        {
            CoachingId = coachingId.Value,
            BranchId = branchId,
            UserId = user.Id,
            EmployeeCode = request.EmployeeCode,
            QualificationId = qualificationId,
            SpecializationId = specializationId,
            JoiningDate = request.JoiningDate ?? DateTime.UtcNow,
            EmploymentType = request.EmploymentType,
            Salary = request.Salary
        };

        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = teacher.Id }, teacher);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateTeacherRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var teacher = await _context.Teachers
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id && t.CoachingId == coachingId.Value && !t.IsDeleted && !t.User.IsDeleted);

        if (teacher == null)
            return NotFound(new { message = "Teacher not found" });

        // Update user fields
        if (!string.IsNullOrEmpty(request.FirstName))
            teacher.User.FirstName = request.FirstName;
        if (!string.IsNullOrEmpty(request.LastName))
            teacher.User.LastName = request.LastName;
        if (!string.IsNullOrEmpty(request.Email))
        {
            // Check if email already exists for another user
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.Id != teacher.UserId && u.CoachingId == coachingId.Value && !u.IsDeleted);
            if (existingUser != null)
                return BadRequest(new { message = "Email already exists" });
            teacher.User.Email = request.Email;
        }
        if (request.Phone != null)
            teacher.User.Phone = request.Phone;
        if (request.IsActive.HasValue)
            teacher.User.IsActive = request.IsActive.Value;

        // Update teacher fields
        if (request.BranchId.HasValue && request.BranchId.Value != 0)
        {
            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == request.BranchId.Value && b.CoachingId == coachingId.Value && !b.IsDeleted);
            if (branch == null)
                return BadRequest(new { message = "Branch not found" });
            teacher.BranchId = request.BranchId.Value;
        }
        if (request.EmployeeCode != null)
            teacher.EmployeeCode = request.EmployeeCode;
        if (request.QualificationId.HasValue)
        {
            if (request.QualificationId.Value == 0)
            {
                teacher.QualificationId = null;
            }
            else
            {
                var qualification = await _context.Qualifications
                    .FirstOrDefaultAsync(q => q.Id == request.QualificationId.Value && 
                                             q.CoachingId == coachingId.Value && 
                                             !q.IsDeleted);
                if (qualification == null)
                    return BadRequest(new { message = "Qualification not found" });
                teacher.QualificationId = qualification.Id;
            }
        }
        if (request.SpecializationId.HasValue)
        {
            if (request.SpecializationId.Value == 0)
            {
                teacher.SpecializationId = null;
            }
            else
            {
                var specialization = await _context.Specializations
                    .FirstOrDefaultAsync(s => s.Id == request.SpecializationId.Value && 
                                             s.CoachingId == coachingId.Value && 
                                             !s.IsDeleted);
                if (specialization == null)
                    return BadRequest(new { message = "Specialization not found" });
                teacher.SpecializationId = specialization.Id;
            }
        }
        if (request.JoiningDate.HasValue)
            teacher.JoiningDate = request.JoiningDate;
        if (request.EmploymentType.HasValue)
            teacher.EmploymentType = request.EmploymentType.Value;
        if (request.Salary.HasValue)
            teacher.Salary = request.Salary;

        teacher.UpdatedAt = DateTime.UtcNow;
        teacher.User.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Teacher updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var teacher = await _context.Teachers
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id && t.CoachingId == coachingId.Value && !t.IsDeleted && !t.User.IsDeleted);

        if (teacher == null)
            return NotFound(new { message = "Teacher not found" });

        // Check if teacher is assigned to any batches or courses
        var hasBatches = await _context.Batches
            .AnyAsync(b => b.TeacherId == teacher.Id && !b.IsDeleted);
        var hasCourses = await _context.Courses
            .AnyAsync(c => c.TeacherId == teacher.Id && !c.IsDeleted);

        if (hasBatches || hasCourses)
            return BadRequest(new { message = "Cannot delete teacher assigned to batches or courses. Please reassign them first." });

        // Soft delete
        teacher.IsDeleted = true;
        teacher.UpdatedAt = DateTime.UtcNow;
        teacher.User.IsDeleted = true;
        teacher.User.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Teacher deleted successfully" });
    }
}

