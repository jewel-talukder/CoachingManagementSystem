using System.Net;
using System.Net.Mail;
using CoachingManagementSystem.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CoachingManagementSystem.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        try
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var port = int.Parse(_configuration["EmailSettings:Port"] ?? "587");
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"];
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var senderName = _configuration["EmailSettings:SenderName"];

            using var client = new SmtpClient(smtpServer, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail!, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml
            };
            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email to {To}", to);
            // We don't throw here to prevent user creation from failing if email fails
            // but in production, you might want to handle this differently
        }
    }

    public async Task SendWelcomeEmailAsync(string to, string name, string email, string password)
    {
        string subject = "Welcome to Coaching Sheba - Your Teacher Account Credentials";
        
        string body = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }}
                .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px; }}
                .content {{ padding: 20px; background-color: #ffffff; }}
                .credentials {{ background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #d1d5db; }}
                .credentials p {{ margin: 5px 0; font-weight: bold; }}
                .footer {{ text-align: center; font-size: 12px; color: #6b7280; padding: 20px; }}
                .button {{ display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Welcome to Coaching Sheba!</h1>
                </div>
                <div class='content'>
                    <p>Hello <strong>{name}</strong>,</p>
                    <p>Welcome to our coaching community! Your teacher account has been successfully created. You can now log in to the admin panel to manage your batches, students, and more.</p>
                    
                    <div class='credentials'>
                        <p>Login URL: <a href='http://localhost:3000/login'>Admin Portal</a></p>
                        <p>Username (Email): {email}</p>
                        <p>Password: {password}</p>
                    </div>
                    
                    <p>For security reasons, we recommend that you change your password after your first login.</p>
                    
                    <a href='http://localhost:3000/login' class='button'>Log In Now</a>
                    
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <p>Best regards,<br>The Coaching Sheba Team</p>
                </div>
                <div class='footer'>
                    &copy; {DateTime.Now.Year} Coaching Sheba Management System. All rights reserved.
                </div>
            </div>
        </body>
        </html>";

        await SendEmailAsync(to, subject, body, true);
    }
}
