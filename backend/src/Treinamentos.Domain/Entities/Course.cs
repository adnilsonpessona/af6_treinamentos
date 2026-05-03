using Treinamentos.Domain.Enums;

namespace Treinamentos.Domain.Entities;

public class Course
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CompanyId { get; set; }
    public string Department { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Guid SubCategoryId { get; set; }
    public bool AvailableForAllCompanies { get; set; }
    public bool AvailableForAllDepartments { get; set; }
    public string? ThumbnailPath { get; set; }
    public CourseStatus Status { get; set; } = CourseStatus.Rascunho;
    public Guid InstructorId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Company Company { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public Category SubCategory { get; set; } = null!;
    public User Instructor { get; set; } = null!;
    public ICollection<Lesson> Lessons { get; set; } = [];
    public ICollection<CourseApproval> Approvals { get; set; } = [];
    public ICollection<CourseDepartmentPermission> DepartmentPermissions { get; set; } = [];
    public ICollection<CourseUserPermission> UserPermissions { get; set; } = [];
    public ICollection<CourseCompletion> Completions { get; set; } = [];
}
