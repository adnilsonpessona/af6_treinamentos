using Treinamentos.Domain.Enums;

namespace Treinamentos.Application.DTOs.Lessons;

public record LessonResponse(
    Guid Id,
    Guid CourseId,
    string Title,
    int Order,
    LessonType Type,
    bool HasVideo,
    bool HasText,
    long? VideoDurationSeconds,
    string? ContentHtml,
    DateTime CreatedAt
);
