using Treinamentos.Application.DTOs.Categories;
using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Interfaces;

namespace Treinamentos.Application.Services;

public class CategoryService
{
    private readonly IUnitOfWork _uow;

    public CategoryService(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<CategoryResponse>> GetAllAsync(bool? activeOnly = null)
    {
        var categories = await _uow.Categories.GetAllAsync();
        if (activeOnly == true)
            categories = categories.Where(c => c.IsActive);

        var indexed = categories.ToDictionary(c => c.Id, c => c);
        return categories
            .OrderBy(c => c.ParentCategoryId.HasValue ? 1 : 0)
            .ThenBy(c => c.Name)
            .Select(c => ToResponse(c, indexed));
    }

    public async Task<CategoryResponse> GetByIdAsync(Guid id)
    {
        var category = await _uow.Categories.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        string? parentName = null;
        if (category.ParentCategoryId.HasValue)
        {
            var parent = await _uow.Categories.GetByIdAsync(category.ParentCategoryId.Value);
            parentName = parent?.Name;
        }

        return ToResponse(category, parentName);
    }

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request)
    {
        Category? parent = null;
        if (request.ParentCategoryId.HasValue)
        {
            parent = await _uow.Categories.GetByIdAsync(request.ParentCategoryId.Value)
                ?? throw new KeyNotFoundException("Categoria pai não encontrada.");

            if (!parent.IsActive)
                throw new InvalidOperationException("Categoria pai está inativa.");

            if (parent.ParentCategoryId.HasValue)
                throw new InvalidOperationException("Subcategoria não pode ter outra subcategoria como pai.");
        }

        if (await _uow.Categories.AnyAsync(c =>
            c.Name.ToLower() == request.Name.ToLower() &&
            c.ParentCategoryId == request.ParentCategoryId))
            throw new InvalidOperationException("Já existe uma categoria com este nome.");

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            ParentCategoryId = request.ParentCategoryId,
            IsActive = true
        };

        await _uow.Categories.AddAsync(category);
        await _uow.SaveChangesAsync();
        return ToResponse(category, parent?.Name);
    }

    public async Task<CategoryResponse> UpdateAsync(Guid id, UpdateCategoryRequest request)
    {
        var category = await _uow.Categories.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        Category? parent = null;
        if (request.ParentCategoryId.HasValue)
        {
            if (request.ParentCategoryId == id)
                throw new InvalidOperationException("Categoria não pode ser pai dela mesma.");

            parent = await _uow.Categories.GetByIdAsync(request.ParentCategoryId.Value)
                ?? throw new KeyNotFoundException("Categoria pai não encontrada.");

            if (parent.ParentCategoryId.HasValue)
                throw new InvalidOperationException("Subcategoria não pode ter outra subcategoria como pai.");
        }

        if (await _uow.Categories.AnyAsync(c =>
            c.Name.ToLower() == request.Name.ToLower() &&
            c.ParentCategoryId == request.ParentCategoryId &&
            c.Id != id))
            throw new InvalidOperationException("Já existe outra categoria com este nome.");

        category.Name = request.Name;
        category.ParentCategoryId = request.ParentCategoryId;
        category.UpdatedAt = DateTime.UtcNow;
        _uow.Categories.Update(category);
        await _uow.SaveChangesAsync();
        return ToResponse(category, parent?.Name);
    }

    public async Task SetStatusAsync(Guid id, bool active)
    {
        var category = await _uow.Categories.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        if (!active)
        {
            var hasCourses = await _uow.Courses.AnyAsync(c => c.CategoryId == id || c.SubCategoryId == id);
            if (hasCourses)
                throw new InvalidOperationException("Não é possível desativar uma categoria com cursos vinculados.");
        }

        category.IsActive = active;
        category.UpdatedAt = DateTime.UtcNow;
        _uow.Categories.Update(category);
        await _uow.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var category = await _uow.Categories.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        var hasCourses = await _uow.Courses.AnyAsync(c => c.CategoryId == id || c.SubCategoryId == id);
        if (hasCourses)
            throw new InvalidOperationException("Não é possível excluir uma categoria com cursos vinculados.");

        var hasSubCategories = await _uow.Categories.AnyAsync(c => c.ParentCategoryId == id);
        if (hasSubCategories)
            throw new InvalidOperationException("Não é possível excluir uma categoria com subcategorias. Exclua as subcategorias primeiro.");

        _uow.Categories.Remove(category);
        await _uow.SaveChangesAsync();
    }

    private static CategoryResponse ToResponse(Category c, Dictionary<Guid, Category> indexed)
    {
        string? parentName = null;
        if (c.ParentCategoryId.HasValue && indexed.TryGetValue(c.ParentCategoryId.Value, out var parent))
            parentName = parent.Name;

        return ToResponse(c, parentName);
    }

    private static CategoryResponse ToResponse(Category c, string? parentName)
        => new(c.Id, c.Department, c.Name, c.ParentCategoryId, parentName, c.IsActive, c.CreatedAt);
}
