namespace Treinamentos.Application.DTOs.Courses;

public record CreateCourseRequest(
	string Title,
	string Description,
	Guid CompanyId,
	string Department,
	Guid CategoryId,
	Guid SubCategoryId,
	bool AvailableForAllCompanies,
	bool AvailableForAllDepartments
);
