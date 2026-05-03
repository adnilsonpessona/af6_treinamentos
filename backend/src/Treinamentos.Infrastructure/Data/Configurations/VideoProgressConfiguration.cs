using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data.Configurations;

public class VideoProgressConfiguration : IEntityTypeConfiguration<VideoProgress>
{
    public void Configure(EntityTypeBuilder<VideoProgress> builder)
    {
        builder.HasKey(v => v.Id);
        builder.HasIndex(v => new { v.UserId, v.LessonId }).IsUnique();
        builder.Property(v => v.PercentageWatched).HasPrecision(5, 2);

        builder.HasOne(v => v.User)
               .WithMany(u => u.VideoProgresses)
               .HasForeignKey(v => v.UserId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(v => v.Lesson)
               .WithMany(l => l.VideoProgresses)
               .HasForeignKey(v => v.LessonId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
