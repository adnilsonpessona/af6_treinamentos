using Treinamentos.Domain.Enums;

namespace Treinamentos.Domain.Entities;

public class CourseApproval
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Guid AdminId { get; set; }
    public CourseStatus Decision { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Course Course { get; set; } = null!;
    public User Admin { get; set; } = null!;
}
