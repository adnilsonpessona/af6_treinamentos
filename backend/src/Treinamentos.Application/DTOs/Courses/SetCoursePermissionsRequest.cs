namespace Treinamentos.Application.DTOs.Courses;

public record SetCoursePermissionsRequest(
    IEnumerable<string> Departments,
    IEnumerable<Guid> UserIds,
    bool NotifyUsers = false
);
