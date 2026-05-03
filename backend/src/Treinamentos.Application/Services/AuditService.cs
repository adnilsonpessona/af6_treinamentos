using Treinamentos.Application.DTOs.Audit;
using Treinamentos.Domain.Enums;
using Treinamentos.Domain.Interfaces;

namespace Treinamentos.Application.Services;

public class AuditService
{
    private readonly IUnitOfWork _uow;

    public AuditService(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<AuditLogResponse>> GetLogsAsync(
        Guid? userId = null,
        AuditAction? action = null,
        DateTime? from = null,
        DateTime? to = null,
        int page = 1,
        int pageSize = 50)
    {
        var logs = await _uow.AuditLogs.GetAllAsync();
        var users = await _uow.Users.GetAllAsync();

        if (userId.HasValue)
            logs = logs.Where(l => l.UserId == userId);

        if (action.HasValue)
            logs = logs.Where(l => l.Action == action);

        if (from.HasValue)
            logs = logs.Where(l => l.CreatedAt >= from);

        if (to.HasValue)
            logs = logs.Where(l => l.CreatedAt <= to);

        return logs
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new AuditLogResponse(
                l.Id,
                l.UserId,
                l.UserId.HasValue
                    ? users.FirstOrDefault(u => u.Id == l.UserId)?.FullName
                    : null,
                l.Action,
                l.Action.ToString(),
                l.DetailsJson,
                l.IpAddress,
                l.CreatedAt));
    }
}
