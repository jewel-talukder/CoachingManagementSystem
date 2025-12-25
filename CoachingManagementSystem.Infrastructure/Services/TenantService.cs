using Microsoft.AspNetCore.Http;

namespace CoachingManagementSystem.Infrastructure.Services;

public class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? GetCurrentCoachingId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.Items.ContainsKey("CoachingId") == true)
        {
            return (int?)httpContext.Items["CoachingId"];
        }
        return null;
    }

    public void SetCurrentCoachingId(int coachingId)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            httpContext.Items["CoachingId"] = coachingId;
        }
    }
}

