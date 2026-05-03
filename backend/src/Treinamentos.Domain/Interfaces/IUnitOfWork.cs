using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Interfaces.Repositories;

namespace Treinamentos.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    ICourseRepository Courses { get; }
    IVideoProgressRepository VideoProgresses { get; }
    IRepository<Company> Companies { get; }
    IRepository<Category> Categories { get; }
    IRepository<Department> Departments { get; }
    IRepository<Lesson> Lessons { get; }
    IRepository<ActivationToken> ActivationTokens { get; }
    IRepository<UserSession> UserSessions { get; }
    IRepository<RevokedToken> RevokedTokens { get; }
    IRepository<CourseApproval> CourseApprovals { get; }
    IRepository<CourseDepartmentPermission> CourseDepartmentPermissions { get; }
    IRepository<CourseUserPermission> CourseUserPermissions { get; }
    IRepository<LessonAccess> LessonAccesses { get; }
    IRepository<CourseCompletion> CourseCompletions { get; }
    IRepository<AuditLog> AuditLogs { get; }
    Task<int> SaveChangesAsync();
}
