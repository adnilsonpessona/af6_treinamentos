namespace Treinamentos.Application.DTOs.Companies;

public record CreateCompanyRequest(
    int Empresa,
    int Revenda,
    string RazaoSocial,
    string NomeFantasia,
    string Cnpj
);