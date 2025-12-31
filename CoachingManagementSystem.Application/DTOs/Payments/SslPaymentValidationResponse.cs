namespace CoachingManagementSystem.Application.DTOs.Payments;

public class SslPaymentValidationResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public int? PaymentId { get; set; }
    public string? TransactionId { get; set; }
}

