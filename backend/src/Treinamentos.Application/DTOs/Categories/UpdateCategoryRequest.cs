namespace Treinamentos.Application.DTOs.Categories;

public record UpdateCategoryRequest(string Name, Guid? ParentCategoryId);
