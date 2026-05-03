using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Title).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Description).IsRequired();
         builder.Property(c => c.Department).IsRequired().HasMaxLength(100);
         builder.Property(c => c.AvailableForAllCompanies).IsRequired();
         builder.Property(c => c.AvailableForAllDepartments).IsRequired();
        builder.Property(c => c.ThumbnailPath).HasMaxLength(500);
        builder.Property(c => c.Status).IsRequired();

         builder.HasOne(c => c.Company)
             .WithMany(co => co.Courses)
             .HasForeignKey(c => c.CompanyId)
             .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Category)
               .WithMany(cat => cat.Courses)
               .HasForeignKey(c => c.CategoryId)
               .OnDelete(DeleteBehavior.Restrict);

         builder.HasOne(c => c.SubCategory)
             .WithMany(cat => cat.SubCategoryCourses)
             .HasForeignKey(c => c.SubCategoryId)
             .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Instructor)
               .WithMany(u => u.CreatedCourses)
               .HasForeignKey(c => c.InstructorId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
