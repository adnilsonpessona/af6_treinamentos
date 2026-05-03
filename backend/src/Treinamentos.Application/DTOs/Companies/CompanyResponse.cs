namespace Treinamentos.Application.DTOs.Companies;

public record CompanyResponse(
    Guid Id,
    int Empresa,
    int Revenda,
    string RazaoSocial,
    string NomeFantasia,
    string Cnpj,
    bool IsActive,
    DateTime CreatedAt
);