namespace Treinamentos.Application.DTOs.Reports;

public record UserCourseProgressItem(
    Guid UserId,
    string UserName,
    string Department,
    string JobTitle,
    Guid CourseId,
    string CourseTitle,
    decimal ProgressPercentage,
    bool IsCompleted,
    DateTime? CompletedAt,
    DateTime? LastAccessAt
);

public record AdminReportResponse(
    int TotalUsers,
    int TotalCourses,
    int NeverLoggedIn,
    IEnumerable<UserCourseProgressItem> UserProgress,
    IEnumerable<string> MostAccessedCourses
);
