using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data.Configurations;

public class CourseDepartmentPermissionConfiguration : IEntityTypeConfiguration<CourseDepartmentPermission>
{
    public void Configure(EntityTypeBuilder<CourseDepartmentPermission> builder)
    {
        builder.HasKey(p => new { p.CourseId, p.Department });
        builder.Property(p => p.Department).IsRequired().HasMaxLength(100);

        builder.HasOne(p => p.Course)
               .WithMany(c => c.DepartmentPermissions)
               .HasForeignKey(p => p.CourseId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
