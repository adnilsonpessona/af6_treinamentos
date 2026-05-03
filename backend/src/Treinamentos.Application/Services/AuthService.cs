using Treinamentos.Application.DTOs.Auth;
using Treinamentos.Application.Interfaces;
using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Enums;
using Treinamentos.Domain.Interfaces;

namespace Treinamentos.Application.Services;

public class AuthService
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtService _jwt;

    public AuthService(IUnitOfWork uow, IJwtService jwt)
    {
        _uow = uow;
        _jwt = jwt;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        var user = await _uow.Users.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Credenciais inválidas.");

        if (user.Status == UserStatus.Inactive)
            throw new UnauthorizedAccessException("Usuário desativado. Contate o administrador.");

        if (user.Status == UserStatus.PendingActivation)
            throw new UnauthorizedAccessException("Conta ainda não ativada. Verifique seu e-mail.");

        if (user.PasswordHash == null)
            throw new UnauthorizedAccessException("Credenciais inválidas.");

        try
        {
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Credenciais inválidas.");
        }
        catch (BCrypt.Net.SaltParseException)
        {
            throw new UnauthorizedAccessException("Credenciais inválidas.");
        }

        var token = _jwt.GenerateToken(user);
        var expiresAt = _jwt.GetTokenExpiry(token);

        await _uow.UserSessions.AddAsync(new UserSession
        {
            UserId = user.Id,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            LoginAt = DateTime.UtcNow
        });

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = user.Id,
            Action = AuditAction.Login,
            IpAddress = ipAddress,
            DetailsJson = $"{{\"userAgent\":\"{userAgent}\",\"role\":\"{user.Role}\"}}"
        });

        await _uow.SaveChangesAsync();

        string? companyName = null;
        if (user.CompanyId.HasValue)
        {
            var company = await _uow.Companies.GetByIdAsync(user.CompanyId.Value);
            companyName = company?.NomeFantasia;
        }

        return new AuthResponse(
            token,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.CompanyId,
            companyName,
            user.Department,
            expiresAt
        );
    }

    public async Task<AuthResponse> GoogleLoginAsync(string googleEmail, string googleId, string ipAddress, string userAgent)
    {
        var user = await _uow.Users.GetByEmailAsync(googleEmail)
            ?? throw new UnauthorizedAccessException("E-mail não cadastrado na plataforma. Contate o administrador.");

        if (user.Status == UserStatus.Inactive)
            throw new UnauthorizedAccessException("Usuário desativado. Contate o administrador.");

        if (user.Status == UserStatus.PendingActivation)
            throw new UnauthorizedAccessException("Conta ainda não ativada. Verifique seu e-mail.");

        // Vincular GoogleId se ainda não vinculado
        if (user.GoogleId == null)
        {
            user.GoogleId = googleId;
            user.UpdatedAt = DateTime.UtcNow;
            _uow.Users.Update(user);
        }

        var token = _jwt.GenerateToken(user);
        var expiresAt = _jwt.GetTokenExpiry(token);

        await _uow.UserSessions.AddAsync(new UserSession
        {
            UserId = user.Id,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            LoginAt = DateTime.UtcNow
        });

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = user.Id,
            Action = AuditAction.Login,
            IpAddress = ipAddress,
            DetailsJson = $"{{\"method\":\"google\",\"role\":\"{user.Role}\"}}"
        });

        await _uow.SaveChangesAsync();

        string? companyName = null;
        if (user.CompanyId.HasValue)
        {
            var company = await _uow.Companies.GetByIdAsync(user.CompanyId.Value);
            companyName = company?.NomeFantasia;
        }

        return new AuthResponse(
            token,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.CompanyId,
            companyName,
            user.Department,
            expiresAt
        );
    }

    public async Task LogoutAsync(Guid userId, string token, string ipAddress)
    {
        var expiry = _jwt.GetTokenExpiry(token);

        await _uow.RevokedTokens.AddAsync(new RevokedToken
        {
            Token = token,
            ExpiresAt = expiry
        });

        // Registrar fim da sessão mais recente
        var session = (await _uow.UserSessions.FindAsync(
            s => s.UserId == userId && s.LogoutAt == null))
            .OrderByDescending(s => s.LoginAt)
            .FirstOrDefault();

        if (session != null)
        {
            session.LogoutAt = DateTime.UtcNow;
            _uow.UserSessions.Update(session);
        }

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = AuditAction.Logout,
            IpAddress = ipAddress
        });

        await _uow.SaveChangesAsync();
    }

    public async Task ActivateAccountAsync(ActivateAccountRequest request)
    {
        if (request.Password != request.ConfirmPassword)
            throw new ArgumentException("As senhas não coincidem.");

        if (request.Password.Length < 8)
            throw new ArgumentException("A senha deve ter no mínimo 8 caracteres.");

        var activationToken = await _uow.ActivationTokens.FirstOrDefaultAsync(
            t => t.Token == request.Token && !t.IsInvalidated && t.UsedAt == null)
            ?? throw new InvalidOperationException("Token inválido ou já utilizado.");

        if (activationToken.ExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("Token expirado. Solicite um novo link de ativação.");

        var user = await _uow.Users.GetByIdAsync(activationToken.UserId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        user.Status = UserStatus.Active;
        user.UpdatedAt = DateTime.UtcNow;
        _uow.Users.Update(user);

        activationToken.UsedAt = DateTime.UtcNow;
        _uow.ActivationTokens.Update(activationToken);

        await _uow.SaveChangesAsync();
    }

    public async Task<bool> IsTokenRevokedAsync(string token)
        => await _uow.RevokedTokens.AnyAsync(t => t.Token == token);
}
