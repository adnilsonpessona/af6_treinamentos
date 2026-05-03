namespace Treinamentos.Domain.Entities;

public class LessonAccess
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid LessonId { get; set; }
    public DateTime AccessedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
}
