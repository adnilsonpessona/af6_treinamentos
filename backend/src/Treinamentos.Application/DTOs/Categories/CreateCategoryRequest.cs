namespace Treinamentos.Application.DTOs.Categories;

public record CreateCategoryRequest(string Name, Guid? ParentCategoryId);
