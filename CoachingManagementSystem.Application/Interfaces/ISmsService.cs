namespace CoachingManagementSystem.Application.Interfaces;

public interface ISmsService
{
    Task SendSmsAsync(string phone, string message);
    Task SendStudentWelcomeSmsAsync(string phone, string studentName, string studentCode);
}
