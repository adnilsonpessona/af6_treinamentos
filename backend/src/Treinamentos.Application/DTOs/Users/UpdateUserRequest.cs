using Treinamentos.Domain.Enums;

namespace Treinamentos.Application.DTOs.Users;

public record UpdateUserRequest(
    string FullName,
    string Email,
    Guid? CompanyId,
    string Department,
    string JobTitle,
    UserRole Role
);
