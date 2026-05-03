using Treinamentos.Application.DTOs.Companies;
using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Interfaces;

namespace Treinamentos.Application.Services;

public class CompanyService
{
    private readonly IUnitOfWork _uow;

    public CompanyService(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<CompanyResponse>> GetAllAsync(bool? activeOnly = null)
    {
        var companies = await _uow.Companies.GetAllAsync();
        if (activeOnly == true)
            companies = companies.Where(c => c.IsActive);

        return companies
            .OrderBy(c => c.NomeFantasia)
            .Select(ToResponse);
    }

    public async Task<CompanyResponse> GetByIdAsync(Guid id)
    {
        var company = await _uow.Companies.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Empresa não encontrada.");
        return ToResponse(company);
    }

    public async Task<CompanyResponse> CreateAsync(CreateCompanyRequest request)
    {
        ValidateCnpj(request.Cnpj);

        if (await _uow.Companies.AnyAsync(c => c.Cnpj == request.Cnpj))
            throw new InvalidOperationException("Já existe empresa com este CNPJ.");

        if (await _uow.Companies.AnyAsync(c => c.Empresa == request.Empresa && c.Revenda == request.Revenda))
            throw new InvalidOperationException("Já existe empresa com esta combinação Empresa/Revenda.");

        var company = new Company
        {
            Id = Guid.NewGuid(),
            Empresa = request.Empresa,
            Revenda = request.Revenda,
            RazaoSocial = request.RazaoSocial,
            NomeFantasia = request.NomeFantasia,
            Cnpj = request.Cnpj,
            IsActive = true
        };

        await _uow.Companies.AddAsync(company);
        await _uow.SaveChangesAsync();
        return ToResponse(company);
    }

    public async Task<CompanyResponse> UpdateAsync(Guid id, UpdateCompanyRequest request)
    {
        ValidateCnpj(request.Cnpj);

        var company = await _uow.Companies.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Empresa não encontrada.");

        if (await _uow.Companies.AnyAsync(c => c.Cnpj == request.Cnpj && c.Id != id))
            throw new InvalidOperationException("Já existe outra empresa com este CNPJ.");

        if (await _uow.Companies.AnyAsync(c => c.Empresa == request.Empresa && c.Revenda == request.Revenda && c.Id != id))
            throw new InvalidOperationException("Já existe outra empresa com esta combinação Empresa/Revenda.");

        company.Empresa = request.Empresa;
        company.Revenda = request.Revenda;
        company.RazaoSocial = request.RazaoSocial;
        company.NomeFantasia = request.NomeFantasia;
        company.Cnpj = request.Cnpj;
        company.UpdatedAt = DateTime.UtcNow;

        _uow.Companies.Update(company);
        await _uow.SaveChangesAsync();
        return ToResponse(company);
    }

    public async Task SetStatusAsync(Guid id, bool active)
    {
        var company = await _uow.Companies.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Empresa não encontrada.");

        if (!active)
        {
            var hasUsers = await _uow.Users.AnyAsync(u => u.CompanyId == id);
            if (hasUsers)
                throw new InvalidOperationException("Não é possível desativar empresa com usuários vinculados.");
        }

        company.IsActive = active;
        company.UpdatedAt = DateTime.UtcNow;
        _uow.Companies.Update(company);
        await _uow.SaveChangesAsync();
    }

    private static CompanyResponse ToResponse(Company c) => new(
        c.Id,
        c.Empresa,
        c.Revenda,
        c.RazaoSocial,
        c.NomeFantasia,
        c.Cnpj,
        c.IsActive,
        c.CreatedAt
    );

    private static void ValidateCnpj(string cnpj)
    {
        if (cnpj.Length != 14 || cnpj.Any(ch => !char.IsDigit(ch)))
            throw new InvalidOperationException("CNPJ deve conter 14 dígitos numéricos.");
    }
}
