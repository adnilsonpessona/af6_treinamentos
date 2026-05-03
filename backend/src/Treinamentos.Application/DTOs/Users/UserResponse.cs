using Treinamentos.Domain.Enums;

namespace Treinamentos.Application.DTOs.Users;

public record UserResponse(
    Guid Id,
    string FullName,
    string Email,
    Guid? CompanyId,
    string? CompanyName,
    string Department,
    string JobTitle,
    UserRole Role,
    UserStatus Status,
    DateTime CreatedAt
);
