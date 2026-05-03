namespace Treinamentos.Domain.Enums;

public enum AuditAction
{
    Login = 1,
    Logout = 2,
    LessonAccessed = 3,
    VideoProgressUpdated = 4,
    PdfDownloaded = 5,
    UserCreated = 6,
    UserEdited = 7,
    UserActivated = 8,
    UserDeactivated = 9,
    CourseCreated = 10,
    CourseEdited = 11,
    CourseSubmitted = 12,
    CourseApproved = 13,
    CourseRejected = 14,
    CoursePermissionsChanged = 15,
    ActivationEmailResent = 16
}
