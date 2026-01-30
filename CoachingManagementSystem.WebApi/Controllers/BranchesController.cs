using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Features.Branches.DTOs;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BranchesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public BranchesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetAll()
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var branches = await _context.Branches
            .Where(b => b.CoachingId == coachingId.Value && !b.IsDeleted)
            .OrderBy(b => b.IsDefault ? 0 : 1)
            .ThenBy(b => b.Name)
            .Select(b => new BranchDto
            {
                Id = b.Id,
                CoachingId = b.CoachingId,
                Name = b.Name,
                Code = b.Code,
                Address = b.Address,
                City = b.City,
                State = b.State,
                ZipCode = b.ZipCode,
                Country = b.Country,
                Phone = b.Phone,
                Email = b.Email,
                IsActive = b.IsActive,
                IsDefault = b.IsDefault
            })
            .ToListAsync();

        return Ok(branches);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetById(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var branch = await _context.Branches
            .FirstOrDefaultAsync(b => b.Id == id && b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (branch == null)
            return NotFound(new { message = "Branch not found" });

        var branchDto = new BranchDto
        {
            Id = branch.Id,
            CoachingId = branch.CoachingId,
            Name = branch.Name,
            Code = branch.Code,
            Address = branch.Address,
            City = branch.City,
            State = branch.State,
            ZipCode = branch.ZipCode,
            Country = branch.Country,
            Phone = branch.Phone,
            Email = branch.Email,
            IsActive = branch.IsActive,
            IsDefault = branch.IsDefault
        };

        return Ok(branchDto);
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreateBranchRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Check if code already exists for this coaching
        if (!string.IsNullOrEmpty(request.Code))
        {
            var codeExists = await _context.Branches
                .AnyAsync(b => b.CoachingId == coachingId.Value && b.Code == request.Code && !b.IsDeleted);

            if (codeExists)
            {
                return BadRequest(new { message = "Branch code already exists" });
            }
        }

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            var branch = new Branch
            {
                CoachingId = coachingId.Value,
                Name = request.Name,
                Code = request.Code,
                Address = request.Address,
                City = request.City,
                State = request.State,
                ZipCode = request.ZipCode,
                Country = request.Country,
                Phone = request.Phone,
                Email = request.Email,
                IsActive = true,
                IsDefault = false
            };

            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var branchDto = new BranchDto
            {
                Id = branch.Id,
                CoachingId = branch.CoachingId,
                Name = branch.Name,
                Code = branch.Code,
                Address = branch.Address,
                City = branch.City,
                State = branch.State,
                ZipCode = branch.ZipCode,
                Country = branch.Country,
                Phone = branch.Phone,
                Email = branch.Email,
                IsActive = branch.IsActive,
                IsDefault = branch.IsDefault
            };

            return CreatedAtAction(nameof(GetById), new { id = branch.Id }, branchDto);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateBranchRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var branch = await _context.Branches
            .FirstOrDefaultAsync(b => b.Id == id && b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (branch == null)
            return NotFound(new { message = "Branch not found" });

        // Check if code already exists for another branch
        if (!string.IsNullOrEmpty(request.Code) && request.Code != branch.Code)
        {
            var codeExists = await _context.Branches
                .AnyAsync(b => b.CoachingId == coachingId.Value && b.Code == request.Code && b.Id != id && !b.IsDeleted);

            if (codeExists)
            {
                return BadRequest(new { message = "Branch code already exists" });
            }
        }

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            branch.Name = request.Name;
            branch.Code = request.Code;
            branch.Address = request.Address;
            branch.City = request.City;
            branch.State = request.State;
            branch.ZipCode = request.ZipCode;
            branch.Country = request.Country;
            branch.Phone = request.Phone;
            branch.Email = request.Email;
            branch.IsActive = request.IsActive;
            branch.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Branch updated successfully" });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var branch = await _context.Branches
            .FirstOrDefaultAsync(b => b.Id == id && b.CoachingId == coachingId.Value && !b.IsDeleted);

        if (branch == null)
            return NotFound(new { message = "Branch not found" });

        if (branch.IsDefault)
        {
            return BadRequest(new { message = "Cannot delete default branch" });
        }

        // Check if branch has any students, teachers, courses, or batches
        var hasStudents = await _context.Students.AnyAsync(s => s.BranchId == id && !s.IsDeleted);
        var hasTeachers = await _context.Teachers.AnyAsync(t => t.BranchId == id && !t.IsDeleted);
        var hasCourses = await _context.Courses.AnyAsync(c => c.BranchId == id && !c.IsDeleted);
        var hasBatches = await _context.Batches.AnyAsync(b => b.BranchId == id && !b.IsDeleted);

        if (hasStudents || hasTeachers || hasCourses || hasBatches)
        {
            return BadRequest(new { message = "Cannot delete branch with associated data. Please remove all students, teachers, courses, and batches first." });
        }

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            // Soft delete
            branch.IsDeleted = true;
            branch.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Branch deleted successfully" });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
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

