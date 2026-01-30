using CoachingManagementSystem.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;

namespace CoachingManagementSystem.Infrastructure.Services;

public class SmsService : ISmsService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmsService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public SmsService(IConfiguration configuration, ILogger<SmsService> logger, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task SendSmsAsync(string phone, string message)
    {
        try
        {
            var apiUrl = _configuration["SmsSettings:ApiUrl"];
            var apiKey = _configuration["SmsSettings:ApiKey"];
            var senderId = _configuration["SmsSettings:SenderId"];

            if (string.IsNullOrEmpty(apiUrl) || string.IsNullOrEmpty(apiKey))
            {
                _logger.LogWarning("SMS settings are not configured. Skipping SMS to {Phone}", phone);
                return;
            }

            // This is a generic implementation. The actual parameters will depend on the SMS gateway provider.
            // Example for a common gateway:
            var client = _httpClientFactory.CreateClient();
            
            // Example form data / query params
            var values = new Dictionary<string, string>
            {
                { "api_key", apiKey },
                { "sender_id", senderId ?? "" },
                { "number", phone },
                { "message", message }
            };

            var content = new FormUrlEncodedContent(values);
            
            // In a real scenario, you would uncomment this when the user provides the real API details
            // var response = await client.PostAsync(apiUrl, content);
            // response.EnsureSuccessStatusCode();

            _logger.LogInformation("SMS simulator: Sent to {Phone} with message: {Message}", phone, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SMS to {Phone}", phone);
        }
    }

    public async Task SendStudentWelcomeSmsAsync(string phone, string studentName, string studentCode)
    {
        var template = _configuration["SmsSettings:MessageTemplate"] ?? "Welcome {0}! Your account is ready. Code: {1}";
        var message = string.Format(template, studentName, studentCode);
        
        await SendSmsAsync(phone, message);
    }
}
