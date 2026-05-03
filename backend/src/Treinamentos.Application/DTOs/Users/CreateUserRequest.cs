using Treinamentos.Domain.Enums;

namespace Treinamentos.Application.DTOs.Users;

public record CreateUserRequest(
    string FullName,
    string Email,
    string Cpf,
    Guid? CompanyId,
    string Department,
    string JobTitle,
    UserRole Role
);
