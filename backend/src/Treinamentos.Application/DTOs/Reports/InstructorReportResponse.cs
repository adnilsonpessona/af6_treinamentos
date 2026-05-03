namespace Treinamentos.Application.DTOs.Reports;

public record LessonAccessStat(
    Guid LessonId,
    string LessonTitle,
    int TotalAccesses,
    decimal CompletionPercentage
);

public record InstructorReportResponse(
    Guid CourseId,
    string CourseTitle,
    int TotalStudents,
    int CompletedStudents,
    IEnumerable<UserCourseProgressItem> StudentProgress,
    IEnumerable<LessonAccessStat> LessonStats
);
