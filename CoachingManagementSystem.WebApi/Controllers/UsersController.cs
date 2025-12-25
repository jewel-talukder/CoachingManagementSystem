using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Features.Users.DTOs;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Domain.Entities;
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
    public async Task<ActionResult> GetAll([FromQuery] string? role, [FromQuery] bool? isActive)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var usersQuery = _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Where(u => u.CoachingId == coachingId.Value && !u.IsDeleted);

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

        // Check if email already exists
        var emailExists = await _context.Users
            .AnyAsync(u => u.Email == request.Email && !u.IsDeleted);

        if (emailExists)
        {
            return BadRequest(new { message = "Email already exists" });
        }

        // Verify roles exist
        var roles = await _context.Roles
            .Where(r => request.RoleIds.Contains(r.Id) && !r.IsDeleted)
            .ToListAsync();

        if (roles.Count != request.RoleIds.Count)
        {
            return BadRequest(new { message = "One or more roles not found" });
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
            var teacher = new Teacher
            {
                CoachingId = coachingId.Value,
                UserId = user.Id,
                EmployeeCode = request.AdditionalData?.ContainsKey("EmployeeCode") == true 
                    ? request.AdditionalData["EmployeeCode"]?.ToString() 
                    : null,
                Qualification = request.AdditionalData?.ContainsKey("Qualification") == true 
                    ? request.AdditionalData["Qualification"]?.ToString() 
                    : null,
                Specialization = request.AdditionalData?.ContainsKey("Specialization") == true 
                    ? request.AdditionalData["Specialization"]?.ToString() 
                    : null
            };
            _context.Teachers.Add(teacher);
        }
        else if (request.UserType == "Student")
        {
            var student = new Student
            {
                CoachingId = coachingId.Value,
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

        await _context.SaveChangesAsync();

        return Ok(new { message = "User updated successfully" });
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

