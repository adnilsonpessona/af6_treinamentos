using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data.Configurations;

public class LessonConfiguration : IEntityTypeConfiguration<Lesson>
{
    public void Configure(EntityTypeBuilder<Lesson> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Title).IsRequired().HasMaxLength(200);
        builder.Property(l => l.Type).IsRequired();
        builder.Property(l => l.VideoPath).HasMaxLength(500);
        builder.Property(l => l.ContentHtml).HasColumnType("text");

        builder.HasOne(l => l.Course)
               .WithMany(c => c.Lessons)
               .HasForeignKey(l => l.CourseId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
