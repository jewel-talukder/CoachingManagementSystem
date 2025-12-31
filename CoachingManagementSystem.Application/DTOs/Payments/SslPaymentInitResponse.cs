namespace CoachingManagementSystem.Application.DTOs.Payments;

public class SslPaymentInitResponse
{
    public bool Success { get; set; }
    public string? GatewayUrl { get; set; }
    public string? SessionKey { get; set; }
    public string? Message { get; set; }
}

