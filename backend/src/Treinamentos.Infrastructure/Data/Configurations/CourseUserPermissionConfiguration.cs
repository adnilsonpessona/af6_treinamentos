using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data.Configurations;

public class CourseUserPermissionConfiguration : IEntityTypeConfiguration<CourseUserPermission>
{
    public void Configure(EntityTypeBuilder<CourseUserPermission> builder)
    {
        builder.HasKey(p => new { p.CourseId, p.UserId });

        builder.HasOne(p => p.Course)
               .WithMany(c => c.UserPermissions)
               .HasForeignKey(p => p.CourseId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.User)
               .WithMany(u => u.CourseUserPermissions)
               .HasForeignKey(p => p.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
