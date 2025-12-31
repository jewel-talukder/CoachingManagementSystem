namespace CoachingManagementSystem.Application.DTOs.Payments;

public class SslPaymentInitRequest
{
    public int EnrollmentId { get; set; }
    public int StudentId { get; set; }
    public decimal Amount { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerAddress { get; set; }
    public string? CustomerCity { get; set; }
    public string? CustomerCountry { get; set; }
    public string? Description { get; set; }
}

