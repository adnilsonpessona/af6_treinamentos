using Treinamentos.Domain.Enums;

namespace Treinamentos.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public Guid? CompanyId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; } = UserStatus.PendingActivation;
    public string? PasswordHash { get; set; }
    public string? GoogleId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Company? Company { get; set; }
    public ICollection<ActivationToken> ActivationTokens { get; set; } = [];
    public ICollection<UserSession> Sessions { get; set; } = [];
    public ICollection<Course> CreatedCourses { get; set; } = [];
    public ICollection<VideoProgress> VideoProgresses { get; set; } = [];
    public ICollection<LessonAccess> LessonAccesses { get; set; } = [];
    public ICollection<CourseCompletion> CourseCompletions { get; set; } = [];
    public ICollection<AuditLog> AuditLogs { get; set; } = [];
    public ICollection<CourseUserPermission> CourseUserPermissions { get; set; } = [];
}
