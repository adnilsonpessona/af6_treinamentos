using Treinamentos.Domain.Enums;

namespace Treinamentos.Application.DTOs.Audit;

public record AuditLogResponse(
    Guid Id,
    Guid? UserId,
    string? UserName,
    AuditAction Action,
    string ActionName,
    string? DetailsJson,
    string? IpAddress,
    DateTime CreatedAt
);
