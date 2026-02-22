using CoachingManagementSystem.Application.Common;
using CoachingManagementSystem.Application.Features.Courses.DTOs;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CoachingManagementSystem.Application.Features.Courses.Commands;

public class CreateCourseCommand
{
    public CreateCourseRequest Request { get; set; } = null!;
    public int CoachingId { get; set; }
    public int BranchId { get; set; }
}

public class CreateCourseCommandHandler
{
    private readonly IApplicationDbContext _context;

    public CreateCourseCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BaseResponse<CourseDto>> Handle(CreateCourseCommand command, CancellationToken cancellationToken)
    {
        try
        {
            // Check if code already exists for this branch
            if (!string.IsNullOrEmpty(command.Request.Code))
            {
                var codeExists = await _context.Courses
                    .AnyAsync(c => c.BranchId == command.BranchId && c.Code == command.Request.Code && !c.IsDeleted, cancellationToken);

                if (codeExists)
                {
                    return BaseResponse<CourseDto>.ErrorResponse("Course code already exists for this branch");
                }
            }

            var course = new Course
            {
                CoachingId = command.CoachingId,
                BranchId = command.BranchId,
                Name = command.Request.Name,
                Description = command.Request.Description,
                Code = command.Request.Code,
                Fee = command.Request.Fee,
                DurationMonths = command.Request.DurationMonths,
                StartDate = command.Request.StartDate,
                TeacherId = command.Request.TeacherId,
                IsActive = true
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync(cancellationToken);

            var courseDto = new CourseDto
            {
                Id = course.Id,
                Name = course.Name,
                Description = course.Description,
                Code = course.Code,
                Fee = course.Fee,
                DurationMonths = course.DurationMonths,
                StartDate = course.StartDate,
                IsActive = course.IsActive,
                TeacherId = course.TeacherId
            };

            return BaseResponse<CourseDto>.SuccessResponse(courseDto, "Course created successfully");
        }
        catch (Exception ex)
        {
            return BaseResponse<CourseDto>.ErrorResponse($"Error creating course: {ex.Message}");
        }
    }
}

