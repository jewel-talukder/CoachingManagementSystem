using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Domain.Entities;
using CoachingManagementSystem.Application.DTOs.Roles;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Coaching Admin,Super Admin")]
public class RolesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public RolesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetRoles()
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var roles = await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Where(r => (r.CoachingId == coachingId || r.CoachingId == null) && !r.IsDeleted)
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                CoachingId = r.CoachingId,
                Permissions = r.RolePermissions
                    .Where(rp => !rp.IsDeleted)
                    .Select(rp => new PermissionDto
                    {
                        Id = rp.Permission.Id,
                        Name = rp.Permission.Name,
                        Description = rp.Permission.Description,
                        Group = rp.Permission.Group
                    }).ToList()
            })
            .ToListAsync();

        return Ok(roles);
    }

    [HttpPost]
    public async Task<ActionResult<RoleDto>> CreateRole([FromBody] CreateRoleRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        // Check if role name exists for this coaching
        var exists = await _context.Roles
            .AnyAsync(r => r.Name == request.Name && r.CoachingId == coachingId && !r.IsDeleted);
        
        if (exists) return BadRequest(new { message = "Role name already exists" });

        var role = new Role
        {
            Name = request.Name,
            Description = request.Description,
            CoachingId = coachingId
        };

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        // Add permissions
        if (request.PermissionIds.Any())
        {
            foreach (var pId in request.PermissionIds)
            {
                _context.RolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = pId
                });
            }
            await _context.SaveChangesAsync();
        }

        return Ok(new RoleDto { Id = role.Id, Name = role.Name, Description = role.Description });
    }

    [HttpPut("{id}/permissions")]
    public async Task<IActionResult> UpdatePermissions(int id, [FromBody] UpdateRolePermissionsRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == id && r.CoachingId == coachingId && !r.IsDeleted);

        if (role == null) return NotFound();

        // Remove existing permissions
        var existing = await _context.RolePermissions
            .Where(rp => rp.RoleId == id)
            .ToListAsync();
        
        _context.RolePermissions.RemoveRange(existing);

        // Add new ones
        foreach (var pId in request.PermissionIds)
        {
            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = id,
                PermissionId = pId
            });
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("permissions")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetAllPermissions()
    {
        var permissions = await _context.Permissions
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.Group)
            .Select(p => new PermissionDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Group = p.Group
            })
            .ToListAsync();

        return Ok(permissions);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null) return Unauthorized();

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == id && r.CoachingId == coachingId && !r.IsDeleted);

        if (role == null) return NotFound();

        role.IsDeleted = true;
        role.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
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
