using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CoachingManagementSystem.Application.Features.Courses.Commands;
using CoachingManagementSystem.Application.Features.Courses.Queries;
using CoachingManagementSystem.Application.Features.Courses.DTOs;
using CoachingManagementSystem.Application.Interfaces;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly CreateCourseCommandHandler _createHandler;
    private readonly GetAllCoursesQueryHandler _getAllHandler;

    public CoursesController(
        CreateCourseCommandHandler createHandler,
        GetAllCoursesQueryHandler getAllHandler)
    {
        _createHandler = createHandler;
        _getAllHandler = getAllHandler;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] bool? isActive)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var query = new GetAllCoursesQuery
        {
            CoachingId = coachingId.Value,
            IsActive = isActive
        };

        var result = await _getAllHandler.Handle(query, CancellationToken.None);
        
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreateCourseRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var command = new CreateCourseCommand
        {
            Request = request,
            CoachingId = coachingId.Value
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

