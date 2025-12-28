using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CoachingManagementSystem.Application.Features.Courses.Commands;
using CoachingManagementSystem.Application.Features.Courses.Queries;
using CoachingManagementSystem.Application.Features.Courses.DTOs;
using CoachingManagementSystem.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly CreateCourseCommandHandler _createHandler;
    private readonly GetAllCoursesQueryHandler _getAllHandler;
    private readonly IApplicationDbContext _context;

    public CoursesController(
        CreateCourseCommandHandler createHandler,
        GetAllCoursesQueryHandler getAllHandler,
        IApplicationDbContext context)
    {
        _createHandler = createHandler;
        _getAllHandler = getAllHandler;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] bool? isActive, [FromQuery] int? branchId)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var query = new GetAllCoursesQuery
        {
            CoachingId = coachingId.Value,
            BranchId = branchId,
            IsActive = isActive
        };

        var result = await _getAllHandler.Handle(query, CancellationToken.None);
        
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreateCourseRequest request, [FromQuery] int? branchId)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Get branchId from query or use default branch
        int finalBranchId;
        if (branchId.HasValue)
        {
            finalBranchId = branchId.Value;
        }
        else
        {
            // Get default branch
            var defaultBranch = await _context.Branches
                .FirstOrDefaultAsync(b => b.CoachingId == coachingId.Value && b.IsDefault && !b.IsDeleted);
            
            if (defaultBranch == null)
            {
                return BadRequest(new { message = "No default branch found. Please specify a branchId." });
            }
            
            finalBranchId = defaultBranch.Id;
        }

        var command = new CreateCourseCommand
        {
            Request = request,
            CoachingId = coachingId.Value,
            BranchId = finalBranchId
        };

        var result = await _createHandler.Handle(command, CancellationToken.None);
        
        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetAll), new { id = result.Data!.Id }, result);
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

