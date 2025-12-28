using CoachingManagementSystem.Application.DTOs.Auth;

namespace CoachingManagementSystem.Application.Features.Subscriptions.DTOs;

public class CurrentSubscriptionDto
{
    public int SubscriptionId { get; set; }
    public PlanDto Plan { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? TrialEndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool AutoRenew { get; set; }
    public DateTime? SubscriptionExpiresAt { get; set; }
}

public class ChangePlanRequest
{
    public int PlanId { get; set; }
    public bool AutoRenew { get; set; } = false;
}

