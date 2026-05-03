namespace Treinamentos.Application.Interfaces;

public interface IEmailService
{
    Task SendActivationEmailAsync(string toEmail, string toName, string activationLink);
    Task SendNewCourseEmailAsync(string toEmail, string toName, string courseTitle, string courseDescription, string courseLink);
}
