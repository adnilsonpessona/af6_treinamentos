using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Interfaces;
using Treinamentos.Domain.Interfaces.Repositories;
using Treinamentos.Infrastructure.Repositories;

namespace Treinamentos.Infrastructure.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IUserRepository Users { get; }
    public ICourseRepository Courses { get; }
    public IVideoProgressRepository VideoProgresses { get; }
    public IRepository<Company> Companies { get; }
    public IRepository<Category> Categories { get; }
    public IRepository<Department> Departments { get; }
    public IRepository<Lesson> Lessons { get; }
    public IRepository<ActivationToken> ActivationTokens { get; }
    public IRepository<UserSession> UserSessions { get; }
    public IRepository<RevokedToken> RevokedTokens { get; }
    public IRepository<CourseApproval> CourseApprovals { get; }
    public IRepository<CourseDepartmentPermission> CourseDepartmentPermissions { get; }
    public IRepository<CourseUserPermission> CourseUserPermissions { get; }
    public IRepository<LessonAccess> LessonAccesses { get; }
    public IRepository<CourseCompletion> CourseCompletions { get; }
    public IRepository<AuditLog> AuditLogs { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Users = new UserRepository(context);
        Courses = new CourseRepository(context);
        VideoProgresses = new VideoProgressRepository(context);
        Companies = new Repository<Company>(context);
        Categories = new Repository<Category>(context);
        Departments = new Repository<Department>(context);
        Lessons = new Repository<Lesson>(context);
        ActivationTokens = new Repository<ActivationToken>(context);
        UserSessions = new Repository<UserSession>(context);
        RevokedTokens = new Repository<RevokedToken>(context);
        CourseApprovals = new Repository<CourseApproval>(context);
        CourseDepartmentPermissions = new Repository<CourseDepartmentPermission>(context);
        CourseUserPermissions = new Repository<CourseUserPermission>(context);
        LessonAccesses = new Repository<LessonAccess>(context);
        CourseCompletions = new Repository<CourseCompletion>(context);
        AuditLogs = new Repository<AuditLog>(context);
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public void Dispose() => _context.Dispose();
}
