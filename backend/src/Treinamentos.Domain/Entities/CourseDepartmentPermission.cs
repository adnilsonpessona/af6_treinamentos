namespace Treinamentos.Domain.Entities;

public class CourseDepartmentPermission
{
    public Guid CourseId { get; set; }
    public string Department { get; set; } = string.Empty;
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Course Course { get; set; } = null!;
}
