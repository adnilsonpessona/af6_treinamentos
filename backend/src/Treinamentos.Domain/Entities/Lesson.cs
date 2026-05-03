using Treinamentos.Domain.Enums;

namespace Treinamentos.Domain.Entities;

public class Lesson
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Order { get; set; }
    public LessonType Type { get; set; }
    public string? VideoPath { get; set; }
    public long? VideoDurationSeconds { get; set; }
    public string? ContentHtml { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Course Course { get; set; } = null!;
    public ICollection<VideoProgress> VideoProgresses { get; set; } = [];
    public ICollection<LessonAccess> LessonAccesses { get; set; } = [];
}
