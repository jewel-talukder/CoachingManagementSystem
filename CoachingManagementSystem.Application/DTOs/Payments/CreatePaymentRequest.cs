namespace CoachingManagementSystem.Application.DTOs.Payments;

public class CreatePaymentRequest
{
    public int EnrollmentId { get; set; }
    public int StudentId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, Online, Bank Transfer, SSL
    public string? TransactionId { get; set; }
    public string? Remarks { get; set; }
}

