namespace Treinamentos.Application.DTOs.Companies;

public record UpdateCompanyRequest(
    int Empresa,
    int Revenda,
    string RazaoSocial,
    string NomeFantasia,
    string Cnpj
);