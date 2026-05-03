namespace Treinamentos.Application.DTOs.Auth;

public record AuthResponse(
    string Token,
    string FullName,
    string Email,
    string Role,
    Guid? CompanyId,
    string? CompanyName,
    string Department,
    DateTime ExpiresAt
);
