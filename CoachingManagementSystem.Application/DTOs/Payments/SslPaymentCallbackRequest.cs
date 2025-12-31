namespace CoachingManagementSystem.Application.DTOs.Payments;

public class SslPaymentCallbackRequest
{
    public string? Status { get; set; }
    public string? TranId { get; set; }
    public string? ValId { get; set; }
    public string? Amount { get; set; }
    public string? Currency { get; set; }
    public string? CardType { get; set; }
    public string? StoreAmount { get; set; }
    public string? CardNo { get; set; }
    public string? BankTranId { get; set; }
    public string? StoreId { get; set; }
    public string? TranDate { get; set; }
    public string? Error { get; set; }
    public string? CardIssuer { get; set; }
    public string? CardBrand { get; set; }
    public string? CardCategory { get; set; }
    public string? Descriptor { get; set; }
    public string? RiskLevel { get; set; }
    public string? RiskTitle { get; set; }
}

