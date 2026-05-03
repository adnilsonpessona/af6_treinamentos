namespace Treinamentos.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string? Department { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = [];
    public ICollection<Course> Courses { get; set; } = [];
    public ICollection<Course> SubCategoryCourses { get; set; } = [];
}
