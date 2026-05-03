using Treinamentos.Application.DTOs.Users;
using Treinamentos.Application.Interfaces;
using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Enums;
using Treinamentos.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Treinamentos.Application.Services;

public class UserService
{
    private readonly IUnitOfWork _uow;
    private readonly IEmailService _emailService;
    private readonly string _appBaseUrl;

    public UserService(IUnitOfWork uow, IEmailService emailService, IConfiguration config)
    {
        _uow = uow;
        _emailService = emailService;
        _appBaseUrl = config["App:BaseUrl"] ?? "http://localhost:3000";
    }

    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request, Guid adminId)
    {
        if (await _uow.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
            throw new InvalidOperationException("Já existe um usuário com este e-mail.");

        if (await _uow.Users.AnyAsync(u => u.Cpf == request.Cpf))
            throw new InvalidOperationException("Já existe um usuário com este CPF.");

        if (request.Role == UserRole.Funcionario && request.CompanyId == null)
            throw new InvalidOperationException("Funcionário deve estar vinculado a uma empresa.");

        if (request.CompanyId.HasValue)
        {
            var company = await _uow.Companies.GetByIdAsync(request.CompanyId.Value)
                ?? throw new KeyNotFoundException("Empresa não encontrada.");

            if (!company.IsActive)
                throw new InvalidOperationException("Empresa está inativa.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email.ToLower(),
            Cpf = request.Cpf,
            CompanyId = request.CompanyId,
            Department = request.Department,
            JobTitle = request.JobTitle,
            Role = request.Role,
            Status = UserStatus.PendingActivation
        };

        await _uow.Users.AddAsync(user);

        var tokenValue = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("+", "-").Replace("/", "_").Replace("=", "");

        var activationToken = new ActivationToken
        {
            UserId = user.Id,
            Token = tokenValue,
            ExpiresAt = DateTime.UtcNow.AddHours(48)
        };
        await _uow.ActivationTokens.AddAsync(activationToken);

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = adminId,
            Action = AuditAction.UserCreated,
            DetailsJson = $"{{\"createdUserId\":\"{user.Id}\",\"email\":\"{user.Email}\"}}"
        });

        await _uow.SaveChangesAsync();

        var activationLink = $"{_appBaseUrl}/activate?token={tokenValue}";
        _ = _emailService.SendActivationEmailAsync(user.Email, user.FullName, activationLink);

        return await ToResponseAsync(user);
    }

    public async Task<IEnumerable<UserResponse>> GetUsersAsync(string? department = null, string? role = null)
    {
        var users = await _uow.Users.GetAllAsync();

        if (!string.IsNullOrEmpty(department))
            users = users.Where(u => u.Department == department);

        if (!string.IsNullOrEmpty(role) && Enum.TryParse<UserRole>(role, out var roleEnum))
            users = users.Where(u => u.Role == roleEnum);

        var tasks = users.Select(ToResponseAsync);
        return await Task.WhenAll(tasks);
    }

    public async Task<UserResponse> GetUserByIdAsync(Guid id)
    {
        var user = await _uow.Users.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");
        return await ToResponseAsync(user);
    }

    public async Task<UserResponse> UpdateUserAsync(Guid id, UpdateUserRequest request, Guid adminId)
    {
        var user = await _uow.Users.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        if (await _uow.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.Id != id))
            throw new InvalidOperationException("Já existe outro usuário com este e-mail.");

        if (request.Role == UserRole.Funcionario && request.CompanyId == null)
            throw new InvalidOperationException("Funcionário deve estar vinculado a uma empresa.");

        if (request.CompanyId.HasValue)
        {
            var company = await _uow.Companies.GetByIdAsync(request.CompanyId.Value)
                ?? throw new KeyNotFoundException("Empresa não encontrada.");

            if (!company.IsActive)
                throw new InvalidOperationException("Empresa está inativa.");
        }

        user.FullName = request.FullName;
        user.Email = request.Email.ToLower();
        user.CompanyId = request.CompanyId;
        user.Department = request.Department;
        user.JobTitle = request.JobTitle;
        user.Role = request.Role;
        user.UpdatedAt = DateTime.UtcNow;
        _uow.Users.Update(user);

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = adminId,
            Action = AuditAction.UserEdited,
            DetailsJson = $"{{\"editedUserId\":\"{id}\"}}"
        });

        await _uow.SaveChangesAsync();
        return await ToResponseAsync(user);
    }

    public async Task SetUserStatusAsync(Guid id, bool activate, Guid adminId)
    {
        var user = await _uow.Users.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        user.Status = activate ? UserStatus.Active : UserStatus.Inactive;
        user.UpdatedAt = DateTime.UtcNow;
        _uow.Users.Update(user);

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = adminId,
            Action = activate ? AuditAction.UserActivated : AuditAction.UserDeactivated,
            DetailsJson = $"{{\"targetUserId\":\"{id}\"}}"
        });

        await _uow.SaveChangesAsync();
    }

    public async Task ResendActivationAsync(Guid id, Guid adminId)
    {
        var user = await _uow.Users.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        if (user.Status != UserStatus.PendingActivation)
            throw new InvalidOperationException("Usuário já ativado.");

        var existing = await _uow.ActivationTokens.FindAsync(
            t => t.UserId == id && !t.IsInvalidated && t.UsedAt == null);

        foreach (var t in existing)
        {
            t.IsInvalidated = true;
            _uow.ActivationTokens.Update(t);
        }

        var tokenValue = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("+", "-").Replace("/", "_").Replace("=", "");

        await _uow.ActivationTokens.AddAsync(new ActivationToken
        {
            UserId = user.Id,
            Token = tokenValue,
            ExpiresAt = DateTime.UtcNow.AddHours(48)
        });

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = adminId,
            Action = AuditAction.ActivationEmailResent,
            DetailsJson = $"{{\"targetUserId\":\"{id}\"}}"
        });

        await _uow.SaveChangesAsync();

        var activationLink = $"{_appBaseUrl}/activate?token={tokenValue}";
        _ = _emailService.SendActivationEmailAsync(user.Email, user.FullName, activationLink);
    }

    private async Task<UserResponse> ToResponseAsync(User u)
    {
        string? companyName = null;
        if (u.CompanyId.HasValue)
        {
            var company = await _uow.Companies.GetByIdAsync(u.CompanyId.Value);
            companyName = company?.NomeFantasia;
        }

        return new(
            u.Id,
            u.FullName,
            u.Email,
            u.CompanyId,
            companyName,
            u.Department,
            u.JobTitle,
            u.Role,
            u.Status,
            u.CreatedAt
        );
    }

    public async Task DeleteUserAsync(Guid id, Guid adminId)
    {
        var user = await _uow.Users.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        if (id == adminId)
            throw new InvalidOperationException("Não é possível excluir o próprio usuário.");

        // Block if user has ever logged in (has sessions)
        var hasSessions = await _uow.UserSessions.AnyAsync(s => s.UserId == id);
        if (hasSessions)
            throw new InvalidOperationException("Usuário possui sessões de login registradas e não pode ser excluído.");

        // Block if user has any video progress
        var hasProgress = await _uow.VideoProgresses.AnyAsync(p => p.UserId == id);
        if (hasProgress)
            throw new InvalidOperationException("Usuário possui progresso em vídeos e não pode ser excluído.");

        // Block if user has any lesson accesses
        var hasAccesses = await _uow.LessonAccesses.AnyAsync(a => a.UserId == id);
        if (hasAccesses)
            throw new InvalidOperationException("Usuário possui acessos a aulas e não pode ser excluído.");

        // Block if user has any course completions
        var hasCompletions = await _uow.CourseCompletions.AnyAsync(c => c.UserId == id);
        if (hasCompletions)
            throw new InvalidOperationException("Usuário possui conclusões de curso e não pode ser excluído.");

        // Clean up activation tokens before deleting
        var tokens = await _uow.ActivationTokens.FindAsync(t => t.UserId == id);
        foreach (var token in tokens)
            _uow.ActivationTokens.Remove(token);

        _uow.Users.Remove(user);
        await _uow.SaveChangesAsync();
    }
}
