using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.DetailsJson).HasColumnType("jsonb");
        builder.Property(a => a.IpAddress).HasMaxLength(50);
        builder.HasIndex(a => a.CreatedAt);
        builder.HasIndex(a => a.Action);

        builder.HasOne(a => a.User)
               .WithMany(u => u.AuditLogs)
               .HasForeignKey(a => a.UserId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
