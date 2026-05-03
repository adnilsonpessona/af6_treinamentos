namespace Treinamentos.Domain.Entities;

public class CourseCompletion
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Course Course { get; set; } = null!;
}
