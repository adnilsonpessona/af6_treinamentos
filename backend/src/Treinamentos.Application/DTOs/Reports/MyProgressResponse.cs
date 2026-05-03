namespace Treinamentos.Application.DTOs.Reports;

public record MyCourseProgress(
    Guid CourseId,
    string CourseTitle,
    string CategoryName,
    decimal ProgressPercentage,
    bool IsCompleted,
    DateTime? CompletedAt,
    DateTime? LastAccessAt
);

public record MyProgressResponse(
    int AvailableCourses,
    int StartedCourses,
    int CompletedCourses,
    IEnumerable<MyCourseProgress> Courses
);
