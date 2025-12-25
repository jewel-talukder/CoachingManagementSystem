using CoachingManagementSystem.Application.Common;
using CoachingManagementSystem.Application.Features.Courses.DTOs;
using CoachingManagementSystem.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CoachingManagementSystem.Application.Features.Courses.Queries;

public class GetAllCoursesQuery
{
    public int CoachingId { get; set; }
    public bool? IsActive { get; set; }
}

public class GetAllCoursesQueryHandler
{
    private readonly IApplicationDbContext _context;

    public GetAllCoursesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BaseResponse<List<CourseDto>>> Handle(GetAllCoursesQuery query, CancellationToken cancellationToken)
    {
        try
        {
            var coursesQuery = _context.Courses
                .Include(c => c.Teacher)
                    .ThenInclude(t => t!.User)
                .Where(c => c.CoachingId == query.CoachingId && !c.IsDeleted);

            if (query.IsActive.HasValue)
            {
                coursesQuery = coursesQuery.Where(c => c.IsActive == query.IsActive.Value);
            }

            var courses = await coursesQuery
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Code = c.Code,
                    Fee = c.Fee,
                    DurationMonths = c.DurationMonths,
                    IsActive = c.IsActive,
                    TeacherId = c.TeacherId,
                    TeacherName = c.Teacher != null ? $"{c.Teacher.User.FirstName} {c.Teacher.User.LastName}" : null,
                    SubjectCount = c.Subjects.Count,
                    EnrollmentCount = c.Enrollments.Count
                })
                .ToListAsync(cancellationToken);

            return BaseResponse<List<CourseDto>>.SuccessResponse(courses);
        }
        catch (Exception ex)
        {
            return BaseResponse<List<CourseDto>>.ErrorResponse($"Error fetching courses: {ex.Message}");
        }
    }
}

