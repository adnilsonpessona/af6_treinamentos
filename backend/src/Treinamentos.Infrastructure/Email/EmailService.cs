using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using Treinamentos.Application.Interfaces;

namespace Treinamentos.Infrastructure.Email;

public class EmailService : IEmailService
{
    private readonly string _host;
    private readonly int _port;
    private readonly string _user;
    private readonly string _password;
    private readonly string _fromName;

    public EmailService(IConfiguration config)
    {
        _host = config["Smtp:Host"] ?? throw new InvalidOperationException("Smtp:Host not configured");
        _port = int.Parse(config["Smtp:Port"] ?? "587");
        _user = config["Smtp:User"] ?? throw new InvalidOperationException("Smtp:User not configured");
        _password = config["Smtp:Password"] ?? throw new InvalidOperationException("Smtp:Password not configured");
        _fromName = config["Smtp:FromName"] ?? "Plataforma de Treinamentos";
    }

    public async Task SendActivationEmailAsync(string toEmail, string toName, string activationLink)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _user));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = "Ative sua conta — Plataforma de Treinamentos";

        var body = new BodyBuilder
        {
            HtmlBody = $"""
                <h2>Bem-vindo(a), {toName}!</h2>
                <p>Sua conta foi criada na Plataforma de Treinamentos.</p>
                <p>Clique no botão abaixo para ativar sua conta e definir sua senha:</p>
                <p>
                    <a href="{activationLink}" 
                       style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
                        Ativar minha conta
                    </a>
                </p>
                <p style="color:#6b7280;font-size:13px;">Este link expira em 48 horas.</p>
                <p style="color:#6b7280;font-size:13px;">Se você não esperava este e-mail, ignore-o.</p>
            """
        };
        message.Body = body.ToMessageBody();

        await SendAsync(message);
    }

    public async Task SendNewCourseEmailAsync(string toEmail, string toName, string courseTitle, string courseDescription, string courseLink)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _user));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = $"Novo treinamento disponível: {courseTitle}";

        var body = new BodyBuilder
        {
            HtmlBody = $"""
                <h2>Novo treinamento disponível!</h2>
                <h3>{courseTitle}</h3>
                <p>{courseDescription}</p>
                <p>
                    <a href="{courseLink}" 
                       style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
                        Acessar treinamento
                    </a>
                </p>
            """
        };
        message.Body = body.ToMessageBody();

        await SendAsync(message);
    }

    private async Task SendAsync(MimeMessage message)
    {
        using var client = new SmtpClient();
        await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_user, _password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
