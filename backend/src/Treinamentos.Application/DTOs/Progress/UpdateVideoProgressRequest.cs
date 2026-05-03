namespace Treinamentos.Application.DTOs.Progress;

public record UpdateVideoProgressRequest(
    Guid LessonId,
    decimal PercentageWatched,
    long LastSecond
);
