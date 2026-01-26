using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Features.Users.DTOs;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Domain.Entities;
using CoachingManagementSystem.Domain.Enums;
using BCrypt.Net;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public UsersController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetAll([FromQuery] string? role, [FromQuery] bool? isActive, [FromQuery] int? branchId)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var usersQuery = _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Where(u => u.CoachingId == coachingId.Value && !u.IsDeleted);

        // Filter by branch if specified (for Students and Teachers)
        if (branchId.HasValue)
        {
            if (role == "Student")
            {
                var studentUserIds = await _context.Students
                    .Where(s => s.BranchId == branchId.Value && s.CoachingId == coachingId.Value && !s.IsDeleted)
                    .Select(s => s.UserId)
                    .ToListAsync();
                usersQuery = usersQuery.Where(u => studentUserIds.Contains(u.Id));
            }
            else if (role == "Teacher")
            {
                var teacherUserIds = await _context.Teachers
                    .Where(t => t.BranchId == branchId.Value && t.CoachingId == coachingId.Value && !t.IsDeleted)
                    .Select(t => t.UserId)
                    .ToListAsync();
                usersQuery = usersQuery.Where(u => teacherUserIds.Contains(u.Id));
            }
        }

        if (!string.IsNullOrEmpty(role))
        {
            usersQuery = usersQuery.Where(u => u.UserRoles.Any(ur => ur.Role.Name == role));
        }

        if (isActive.HasValue)
        {
            usersQuery = usersQuery.Where(u => u.IsActive == isActive.Value);
        }

        var users = await usersQuery
            .Select(u => new UserListDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Phone = u.Phone,
                Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreateUserRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Check if email already exists (only if email is provided)
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == request.Email && !u.IsDeleted);

            if (emailExists)
            {
                return BadRequest(new { message = "Email already exists" });
            }
        }

        // For students, phone is required if email is not provided
        if (request.UserType == "Student" && string.IsNullOrWhiteSpace(request.Email) && string.IsNullOrWhiteSpace(request.Phone))
        {
            return BadRequest(new { message = "Phone number is required for students when email is not provided" });
        }

        // Check if phone already exists (only if phone is provided and email is not)
        if (!string.IsNullOrWhiteSpace(request.Phone) && string.IsNullOrWhiteSpace(request.Email))
        {
            var phoneExists = await _context.Users
                .AnyAsync(u => u.Phone == request.Phone && !u.IsDeleted);

            if (phoneExists)
            {
                return BadRequest(new { message = "Phone number already exists" });
            }
        }

        // Verify roles exist
        var roles = await _context.Roles
            .Where(r => request.RoleIds.Contains(r.Id) && !r.IsDeleted)
            .ToListAsync();

        if (roles.Count != request.RoleIds.Count)
        {
            return BadRequest(new { message = "One or more roles not found" });
        }

        // Get branchId from request - required for Students and Teachers
        int? branchId = null;
        if (request.AdditionalData?.ContainsKey("BranchId") == true && request.AdditionalData["BranchId"] != null)
        {
            var branchIdValue = request.AdditionalData["BranchId"];
            if (branchIdValue != null)
            {
                if (int.TryParse(branchIdValue.ToString(), out var parsedBranchId))
                {
                    branchId = parsedBranchId;
                }
            }
        }

        // For Students and Teachers, branch is required
        if ((request.UserType == "Student" || request.UserType == "Teacher") && !branchId.HasValue)
        {
            return BadRequest(new { message = "Branch is required for Students and Teachers" });
        }

        // If branchId is provided, verify it exists and belongs to this coaching
        if (branchId.HasValue)
        {
            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == branchId.Value && b.CoachingId == coachingId.Value && !b.IsDeleted);
            
            if (branch == null)
            {
                return BadRequest(new { message = "Invalid branch selected" });
            }
        }
        else
        {
            // For other user types, try to get default branch
            var defaultBranch = await _context.Branches
                .FirstOrDefaultAsync(b => b.CoachingId == coachingId.Value && b.IsDefault && !b.IsDeleted);
            if (defaultBranch != null)
                branchId = defaultBranch.Id;
        }

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

        // Assign roles
        foreach (var role in roles)
        {
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            };
            _context.UserRoles.Add(userRole);
        }

        // Create Teacher or Student record if needed
        if (request.UserType == "Teacher")
        {
            EmploymentType employmentType = EmploymentType.FullTime;
            if (request.AdditionalData?.ContainsKey("EmploymentType") == true)
            {
                var empTypeStr = request.AdditionalData["EmploymentType"]?.ToString();
                if (Enum.TryParse<EmploymentType>(empTypeStr, out var empType))
                {
                    employmentType = empType;
                }
            }

            decimal? salary = null;
            if (request.AdditionalData?.ContainsKey("Salary") == true)
            {
                var salaryStr = request.AdditionalData["Salary"]?.ToString();
                if (decimal.TryParse(salaryStr, out var salaryValue))
                {
                    salary = salaryValue;
                }
            }

            var teacher = new Teacher
            {
                CoachingId = coachingId.Value,
                BranchId = branchId.Value,
                UserId = user.Id,
                EmployeeCode = request.AdditionalData?.ContainsKey("EmployeeCode") == true 
                    ? request.AdditionalData["EmployeeCode"]?.ToString() 
                    : null,
                QualificationId = request.AdditionalData?.ContainsKey("QualificationId") == true 
                    ? (int.TryParse(request.AdditionalData["QualificationId"]?.ToString(), out var qualId) && qualId > 0 ? qualId : (int?)null)
                    : null,
                SpecializationId = request.AdditionalData?.ContainsKey("SpecializationId") == true 
                    ? (int.TryParse(request.AdditionalData["SpecializationId"]?.ToString(), out var specId) && specId > 0 ? specId : (int?)null)
                    : null,
                EmploymentType = employmentType,
                Salary = salary
            };
            _context.Teachers.Add(teacher);
        }
        else if (request.UserType == "Student")
        {
            var student = new Student
            {
                CoachingId = coachingId.Value,
                BranchId = branchId.Value,
                UserId = user.Id,
                StudentCode = request.AdditionalData?.ContainsKey("StudentCode") == true 
                    ? request.AdditionalData["StudentCode"]?.ToString() 
                    : null,
                DateOfBirth = request.AdditionalData?.ContainsKey("DateOfBirth") == true 
                    ? DateTime.Parse(request.AdditionalData["DateOfBirth"]!.ToString()!) 
                    : null,
                ParentName = request.AdditionalData?.ContainsKey("ParentName") == true 
                    ? request.AdditionalData["ParentName"]?.ToString() 
                    : null,
                ParentPhone = request.AdditionalData?.ContainsKey("ParentPhone") == true 
                    ? request.AdditionalData["ParentPhone"]?.ToString() 
                    : null
            };
            _context.Students.Add(student);
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetById(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id && u.CoachingId == coachingId.Value && !u.IsDeleted);

        if (user == null)
            return NotFound(new { message = "User not found" });

        // Get Student or Teacher data if exists
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.UserId == id && s.CoachingId == coachingId.Value && !s.IsDeleted);

        var teacher = await _context.Teachers
            .FirstOrDefaultAsync(t => t.UserId == id && t.CoachingId == coachingId.Value && !t.IsDeleted);

        var userDto = new
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),
            RoleIds = user.UserRoles.Select(ur => ur.Role.Id).ToList(),
            IsActive = user.IsActive,
            UserType = student != null ? "Student" : teacher != null ? "Teacher" : null,
            AdditionalData = student != null ? new Dictionary<string, object>
            {
                ["StudentCode"] = student.StudentCode ?? string.Empty,
                ["DateOfBirth"] = student.DateOfBirth?.ToString("yyyy-MM-dd") ?? string.Empty,
                ["ParentName"] = student.ParentName ?? string.Empty,
                ["ParentPhone"] = student.ParentPhone ?? string.Empty,
                ["Address"] = student.Address ?? string.Empty
            } : teacher != null ? new Dictionary<string, object>
            {
                ["EmployeeCode"] = teacher.EmployeeCode ?? string.Empty,
                ["QualificationId"] = teacher.QualificationId?.ToString() ?? string.Empty,
                ["QualificationName"] = teacher.Qualification?.Name ?? string.Empty,
                ["SpecializationId"] = teacher.SpecializationId?.ToString() ?? string.Empty,
                ["SpecializationName"] = teacher.Specialization?.Name ?? string.Empty,
                ["EmploymentType"] = ((int)teacher.EmploymentType).ToString(),
                ["EmploymentTypeName"] = teacher.EmploymentType.ToString(),
                ["Salary"] = teacher.Salary?.ToString() ?? string.Empty
            } : null
        };

        return Ok(userDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.CoachingId == coachingId.Value && !u.IsDeleted);

        if (user == null)
            return NotFound(new { message = "User not found" });

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Phone = request.Phone;
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        // Update roles
        var existingRoles = await _context.UserRoles
            .Where(ur => ur.UserId == id)
            .ToListAsync();

        _context.UserRoles.RemoveRange(existingRoles);

        var roles = await _context.Roles
            .Where(r => request.RoleIds.Contains(r.Id) && !r.IsDeleted)
            .ToListAsync();

        foreach (var role in roles)
        {
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            };
            _context.UserRoles.Add(userRole);
        }

        // Update Student or Teacher record if needed
        if (request.UserType == "Student" && request.AdditionalData != null)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == id && s.CoachingId == coachingId.Value && !s.IsDeleted);

            if (student != null)
            {
                student.StudentCode = request.AdditionalData.ContainsKey("StudentCode") 
                    ? request.AdditionalData["StudentCode"]?.ToString() 
                    : student.StudentCode;
                student.DateOfBirth = request.AdditionalData.ContainsKey("DateOfBirth") && 
                    !string.IsNullOrEmpty(request.AdditionalData["DateOfBirth"]?.ToString())
                    ? DateTime.Parse(request.AdditionalData["DateOfBirth"]!.ToString()!) 
                    : student.DateOfBirth;
                student.ParentName = request.AdditionalData.ContainsKey("ParentName") 
                    ? request.AdditionalData["ParentName"]?.ToString() 
                    : student.ParentName;
                student.ParentPhone = request.AdditionalData.ContainsKey("ParentPhone") 
                    ? request.AdditionalData["ParentPhone"]?.ToString() 
                    : student.ParentPhone;
                student.Address = request.AdditionalData.ContainsKey("Address") 
                    ? request.AdditionalData["Address"]?.ToString() 
                    : student.Address;
                student.UpdatedAt = DateTime.UtcNow;
            }
        }
        else if (request.UserType == "Teacher" && request.AdditionalData != null)
        {
            var teacher = await _context.Teachers
                .FirstOrDefaultAsync(t => t.UserId == id && t.CoachingId == coachingId.Value && !t.IsDeleted);

            if (teacher != null)
            {
                teacher.EmployeeCode = request.AdditionalData.ContainsKey("EmployeeCode") 
                    ? request.AdditionalData["EmployeeCode"]?.ToString() 
                    : teacher.EmployeeCode;
                if (request.AdditionalData.ContainsKey("QualificationId"))
                {
                    var qualIdStr = request.AdditionalData["QualificationId"]?.ToString();
                    if (int.TryParse(qualIdStr, out var qualId) && qualId > 0)
                    {
                        var qualification = await _context.Qualifications
                            .FirstOrDefaultAsync(q => q.Id == qualId && q.CoachingId == coachingId.Value && !q.IsDeleted);
                        teacher.QualificationId = qualification != null ? qualification.Id : null;
                    }
                    else
                    {
                        teacher.QualificationId = null;
                    }
                }
                if (request.AdditionalData.ContainsKey("SpecializationId"))
                {
                    var specIdStr = request.AdditionalData["SpecializationId"]?.ToString();
                    if (int.TryParse(specIdStr, out var specId) && specId > 0)
                    {
                        var specialization = await _context.Specializations
                            .FirstOrDefaultAsync(s => s.Id == specId && s.CoachingId == coachingId.Value && !s.IsDeleted);
                        teacher.SpecializationId = specialization != null ? specialization.Id : null;
                    }
                    else
                    {
                        teacher.SpecializationId = null;
                    }
                }
                if (request.AdditionalData.ContainsKey("EmploymentType"))
                {
                    var empTypeStr = request.AdditionalData["EmploymentType"]?.ToString();
                    if (Enum.TryParse<EmploymentType>(empTypeStr, out var empType))
                    {
                        teacher.EmploymentType = empType;
                    }
                }
                if (request.AdditionalData.ContainsKey("Salary"))
                {
                    var salaryStr = request.AdditionalData["Salary"]?.ToString();
                    if (decimal.TryParse(salaryStr, out var salaryValue))
                    {
                        teacher.Salary = salaryValue;
                    }
                    else if (string.IsNullOrEmpty(salaryStr))
                    {
                        teacher.Salary = null;
                    }
                }
                teacher.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "User updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.CoachingId == coachingId.Value && !u.IsDeleted);

        if (user == null)
            return NotFound(new { message = "User not found" });

        // Soft delete user
        user.IsDeleted = true;
        user.UpdatedAt = DateTime.UtcNow;

        // Soft delete associated Student or Teacher record
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.UserId == id && s.CoachingId == coachingId.Value && !s.IsDeleted);
        
        if (student != null)
        {
            student.IsDeleted = true;
            student.UpdatedAt = DateTime.UtcNow;
        }

        var teacher = await _context.Teachers
            .FirstOrDefaultAsync(t => t.UserId == id && t.CoachingId == coachingId.Value && !t.IsDeleted);
        
        if (teacher != null)
        {
            teacher.IsDeleted = true;
            teacher.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully" });
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
}

