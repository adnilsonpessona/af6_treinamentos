using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data.Configurations;

public class ActivationTokenConfiguration : IEntityTypeConfiguration<ActivationToken>
{
    public void Configure(EntityTypeBuilder<ActivationToken> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Token).IsRequired().HasMaxLength(500);
        builder.HasIndex(t => t.Token).IsUnique();
        builder.HasOne(t => t.User)
               .WithMany(u => u.ActivationTokens)
               .HasForeignKey(t => t.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
