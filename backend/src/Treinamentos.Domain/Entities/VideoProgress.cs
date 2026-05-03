namespace Treinamentos.Domain.Entities;

public class VideoProgress
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid LessonId { get; set; }
    public decimal PercentageWatched { get; set; } = 0;
    public long LastSecond { get; set; } = 0;
    public bool IsCompleted { get; set; } = false;
    public int ViewSessions { get; set; } = 0;
    public DateTime FirstAccessAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
}
