namespace Treinamentos.Application.DTOs.Reports;

public record ManagerReportResponse(
    string Department,
    int TotalUsers,
    IEnumerable<UserCourseProgressItem> UserProgress
);
