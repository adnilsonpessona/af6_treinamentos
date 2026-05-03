namespace Treinamentos.Application.DTOs.Progress;

public record LessonProgressResponse(
    Guid LessonId,
    string LessonTitle,
    bool VideoCompleted,
    bool TextAccessed,
    bool LessonCompleted,
    decimal? VideoPercentage,
    long? LastSecond
);

public record CourseProgressResponse(
    Guid CourseId,
    string CourseTitle,
    int TotalLessons,
    int CompletedLessons,
    decimal ProgressPercentage,
    bool CourseCompleted,
    DateTime? CourseCompletedAt,
    IEnumerable<LessonProgressResponse> Lessons
);
