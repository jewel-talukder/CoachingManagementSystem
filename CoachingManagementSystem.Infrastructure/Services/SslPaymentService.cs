using System.Text.Json;
using Microsoft.Extensions.Configuration;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Application.DTOs.Payments;

namespace CoachingManagementSystem.Infrastructure.Services;

public class SslPaymentService : IPaymentService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly string _storeId;
    private readonly string _storePassword;
    private readonly bool _isSandbox;
    private readonly string _successUrl;
    private readonly string _failUrl;
    private readonly string _cancelUrl;
    private readonly string _ipnUrl;

    public SslPaymentService(IConfiguration configuration, HttpClient httpClient)
    {
        _configuration = configuration;
        _httpClient = httpClient;
        _storeId = _configuration["SslCommerz:StoreId"] ?? throw new InvalidOperationException("SSL StoreId not configured");
        _storePassword = _configuration["SslCommerz:StorePassword"] ?? throw new InvalidOperationException("SSL StorePassword not configured");
        _isSandbox = bool.Parse(_configuration["SslCommerz:IsSandbox"] ?? "true");
        _successUrl = _configuration["SslCommerz:SuccessUrl"] ?? throw new InvalidOperationException("SSL SuccessUrl not configured");
        _failUrl = _configuration["SslCommerz:FailUrl"] ?? throw new InvalidOperationException("SSL FailUrl not configured");
        _cancelUrl = _configuration["SslCommerz:CancelUrl"] ?? throw new InvalidOperationException("SSL CancelUrl not configured");
        _ipnUrl = _configuration["SslCommerz:IpnUrl"] ?? throw new InvalidOperationException("SSL IpnUrl not configured");
    }

    public async Task<SslPaymentInitResponse> InitiateSslPaymentAsync(SslPaymentInitRequest request)
    {
        try
        {
            var baseUrl = _isSandbox 
                ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
                : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

            var sessionKey = Guid.NewGuid().ToString("N");
            var tranId = $"TXN{DateTime.UtcNow:yyyyMMddHHmmss}{new Random().Next(1000, 9999)}";

            var postData = new Dictionary<string, string>
            {
                { "store_id", _storeId },
                { "store_passwd", _storePassword },
                { "total_amount", request.Amount.ToString("F2") },
                { "currency", "BDT" },
                { "tran_id", tranId },
                { "success_url", _successUrl },
                { "fail_url", _failUrl },
                { "cancel_url", _cancelUrl },
                { "ipn_url", _ipnUrl },
                { "cus_name", request.CustomerName ?? "Customer" },
                { "cus_email", request.CustomerEmail ?? "" },
                { "cus_phone", request.CustomerPhone ?? "" },
                { "cus_add1", request.CustomerAddress ?? "" },
                { "cus_city", request.CustomerCity ?? "" },
                { "cus_country", request.CustomerCountry ?? "Bangladesh" },
                { "shipping_method", "NO" },
                { "product_name", request.Description ?? "Course Fee Payment" },
                { "product_category", "Education" },
                { "product_profile", "general" },
                { "sessionkey", sessionKey }
            };

            var formContent = new FormUrlEncodedContent(postData);
            var response = await _httpClient.PostAsync(baseUrl, formContent);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode && responseContent.Contains("status=success"))
            {
                // Parse the response to get Gateway URL
                var gatewayUrl = ExtractGatewayUrl(responseContent);
                
                return new SslPaymentInitResponse
                {
                    Success = true,
                    GatewayUrl = gatewayUrl,
                    SessionKey = sessionKey,
                    Message = "Payment initiated successfully"
                };
            }

            return new SslPaymentInitResponse
            {
                Success = false,
                Message = "Failed to initiate payment. Please try again."
            };
        }
        catch (Exception ex)
        {
            return new SslPaymentInitResponse
            {
                Success = false,
                Message = $"Error: {ex.Message}"
            };
        }
    }

    public async Task<SslPaymentValidationResponse> ValidateSslPaymentAsync(SslPaymentCallbackRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.ValId) || string.IsNullOrEmpty(request.Amount))
            {
                return new SslPaymentValidationResponse
                {
                    Success = false,
                    Message = "Invalid payment data"
                };
            }

            var baseUrl = _isSandbox
                ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
                : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

            var validationUrl = $"{baseUrl}?val_id={request.ValId}&store_id={_storeId}&store_passwd={_storePassword}&format=json";
            var response = await _httpClient.GetAsync(validationUrl);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var validationResult = JsonSerializer.Deserialize<JsonElement>(responseContent);
                
                if (validationResult.TryGetProperty("status", out var status) && 
                    status.GetString() == "VALID" &&
                    validationResult.TryGetProperty("amount", out var amount) &&
                    amount.GetString() == request.Amount)
                {
                    return new SslPaymentValidationResponse
                    {
                        Success = true,
                        Message = "Payment validated successfully",
                        TransactionId = request.TranId
                    };
                }
            }

            return new SslPaymentValidationResponse
            {
                Success = false,
                Message = "Payment validation failed"
            };
        }
        catch (Exception ex)
        {
            return new SslPaymentValidationResponse
            {
                Success = false,
                Message = $"Validation error: {ex.Message}"
            };
        }
    }

    private string? ExtractGatewayUrl(string responseContent)
    {
        // SSLCommerz returns response in format: status=success&GatewayPageURL=https://...
        var lines = responseContent.Split('\n');
        foreach (var line in lines)
        {
            if (line.Contains("GatewayPageURL="))
            {
                var url = line.Split('=')[1].Trim();
                return url;
            }
        }
        return null;
    }
}

