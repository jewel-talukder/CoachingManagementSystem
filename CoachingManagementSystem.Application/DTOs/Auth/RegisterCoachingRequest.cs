namespace CoachingManagementSystem.Application.DTOs.Auth;

public class RegisterCoachingRequest
{
    public string CoachingName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    
    // Admin user details
    public string AdminFirstName { get; set; } = string.Empty;
    public string AdminLastName { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
    public string? AdminPhone { get; set; }
    
    // Billing period selection (Monthly or Yearly)
    public string BillingPeriod { get; set; } = "Monthly"; // Monthly, Yearly
}

