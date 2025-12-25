namespace CoachingManagementSystem.Domain.Entities;

public class Subscription : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int PlanId { get; set; }
    public Plan Plan { get; set; } = null!;
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? TrialEndDate { get; set; }
    public string Status { get; set; } = "Active"; // Active, Expired, Cancelled, Trial
    public decimal Amount { get; set; }
    public string? PaymentGateway { get; set; }
    public string? TransactionId { get; set; }
    public bool AutoRenew { get; set; } = false;
}

