using Treinamentos.Application.DTOs.Lessons;
using Treinamentos.Domain.Enums;

namespace Treinamentos.Application.DTOs.Courses;

public record CourseDetailResponse(
    Guid Id,
    string Title,
    string Description,
    Guid CompanyId,
    string CompanyName,
    string Department,
    Guid CategoryId,
    string CategoryName,
    Guid SubCategoryId,
    string SubCategoryName,
    bool AvailableForAllCompanies,
    bool AvailableForAllDepartments,
    string? ThumbnailPath,
    CourseStatus Status,
    Guid InstructorId,
    string InstructorName,
    IEnumerable<LessonResponse> Lessons,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
