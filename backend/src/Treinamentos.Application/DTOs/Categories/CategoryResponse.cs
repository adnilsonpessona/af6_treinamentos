namespace Treinamentos.Application.DTOs.Categories;

public record CategoryResponse(
	Guid Id,
	string? Department,
	string Name,
	Guid? ParentCategoryId,
	string? ParentCategoryName,
	bool IsActive,
	DateTime CreatedAt
);
