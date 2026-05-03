using Treinamentos.Application.DTOs.Departments;
using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Interfaces;

namespace Treinamentos.Application.Services;

public class DepartmentService
{
    private readonly IUnitOfWork _uow;

    public DepartmentService(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<DepartmentResponse>> GetAllAsync(bool? activeOnly = null)
    {
        var depts = await _uow.Departments.GetAllAsync();
        if (activeOnly == true) depts = depts.Where(d => d.IsActive);
        return depts.OrderBy(d => d.Name).Select(ToResponse);
    }

    public async Task<DepartmentResponse> GetByIdAsync(Guid id)
    {
        var dept = await _uow.Departments.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Departamento não encontrado.");
        return ToResponse(dept);
    }

    public async Task<DepartmentResponse> CreateAsync(CreateDepartmentRequest request)
    {
        var name = request.Name.Trim();
        if (string.IsNullOrEmpty(name))
            throw new InvalidOperationException("Nome do departamento é obrigatório.");

        if (await _uow.Departments.AnyAsync(d => d.Name.ToLower() == name.ToLower()))
            throw new InvalidOperationException("Já existe um departamento com este nome.");

        var dept = new Department { Id = Guid.NewGuid(), Name = name, IsActive = true };
        await _uow.Departments.AddAsync(dept);
        await _uow.SaveChangesAsync();
        return ToResponse(dept);
    }

    public async Task<DepartmentResponse> UpdateAsync(Guid id, UpdateDepartmentRequest request)
    {
        var dept = await _uow.Departments.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Departamento não encontrado.");

        var name = request.Name.Trim();
        if (string.IsNullOrEmpty(name))
            throw new InvalidOperationException("Nome do departamento é obrigatório.");

        if (await _uow.Departments.AnyAsync(d => d.Name.ToLower() == name.ToLower() && d.Id != id))
            throw new InvalidOperationException("Já existe outro departamento com este nome.");

        dept.Name = name;
        dept.UpdatedAt = DateTime.UtcNow;
        _uow.Departments.Update(dept);
        await _uow.SaveChangesAsync();
        return ToResponse(dept);
    }

    public async Task SetStatusAsync(Guid id, bool active)
    {
        var dept = await _uow.Departments.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Departamento não encontrado.");

        dept.IsActive = active;
        dept.UpdatedAt = DateTime.UtcNow;
        _uow.Departments.Update(dept);
        await _uow.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var dept = await _uow.Departments.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Departamento não encontrado.");

        var hasCourses = await _uow.Courses.AnyAsync(c => c.Department == dept.Name);
        if (hasCourses)
            throw new InvalidOperationException("Não é possível excluir um departamento com cursos vinculados.");

        _uow.Departments.Remove(dept);
        await _uow.SaveChangesAsync();
    }

    private static DepartmentResponse ToResponse(Department d)
        => new(d.Id, d.Name, d.IsActive, d.CreatedAt);
}
