using Microsoft.EntityFrameworkCore;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<ActivationToken> ActivationTokens => Set<ActivationToken>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<RevokedToken> RevokedTokens => Set<RevokedToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<CourseApproval> CourseApprovals => Set<CourseApproval>();
    public DbSet<CourseDepartmentPermission> CourseDepartmentPermissions => Set<CourseDepartmentPermission>();
    public DbSet<CourseUserPermission> CourseUserPermissions => Set<CourseUserPermission>();
    public DbSet<VideoProgress> VideoProgresses => Set<VideoProgress>();
    public DbSet<LessonAccess> LessonAccesses => Set<LessonAccess>();
    public DbSet<CourseCompletion> CourseCompletions => Set<CourseCompletion>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(ToSnakeCase(entity.GetTableName()!));
            foreach (var property in entity.GetProperties())
                property.SetColumnName(ToSnakeCase(property.GetColumnName()));
            foreach (var key in entity.GetKeys())
                key.SetName(ToSnakeCase(key.GetName()!));
            foreach (var fk in entity.GetForeignKeys())
                fk.SetConstraintName(ToSnakeCase(fk.GetConstraintName()!));
            foreach (var index in entity.GetIndexes())
                index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()!));
        }
    }

    private static string ToSnakeCase(string name)
    {
        return string.Concat(name.Select((c, i) =>
            i > 0 && char.IsUpper(c) ? "_" + char.ToLower(c) : char.ToLower(c).ToString()));
    }
}
