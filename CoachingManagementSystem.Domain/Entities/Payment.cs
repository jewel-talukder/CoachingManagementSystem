namespace CoachingManagementSystem.Domain.Entities;

public class Payment : BaseEntity
{
    public int CoachingId { get; set; }
    public Coaching Coaching { get; set; } = null!;
    
    public int BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    
    public int? EnrollmentId { get; set; }
    public Enrollment? Enrollment { get; set; }
    
    public string PaymentType { get; set; } = "Fee"; // Fee, Subscription, Other
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, Online, Bank Transfer
    public string Status { get; set; } = "Completed"; // Pending, Completed, Failed, Refunded
    public string? TransactionId { get; set; }
    public string? Remarks { get; set; }
    public string? ReceiptNumber { get; set; }
}

