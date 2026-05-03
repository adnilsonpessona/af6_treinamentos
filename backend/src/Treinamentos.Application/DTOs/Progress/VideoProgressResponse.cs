namespace Treinamentos.Application.DTOs.Progress;

public record VideoProgressResponse(
    Guid LessonId,
    decimal PercentageWatched,
    long LastSecond,
    bool IsCompleted,
    int ViewSessions,
    DateTime FirstAccessAt,
    DateTime? CompletedAt
);
