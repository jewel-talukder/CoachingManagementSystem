namespace CoachingManagementSystem.Infrastructure.Services;

public interface ITenantService
{
    int? GetCurrentCoachingId();
    void SetCurrentCoachingId(int coachingId);
}

