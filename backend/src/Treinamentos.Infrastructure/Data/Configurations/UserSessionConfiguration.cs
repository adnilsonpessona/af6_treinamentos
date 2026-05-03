using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data.Configurations;

public class UserSessionConfiguration : IEntityTypeConfiguration<UserSession>
{
    public void Configure(EntityTypeBuilder<UserSession> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.IpAddress).IsRequired().HasMaxLength(50);
        builder.Property(s => s.UserAgent).IsRequired().HasMaxLength(500);
        builder.HasOne(s => s.User)
               .WithMany(u => u.Sessions)
               .HasForeignKey(s => s.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
