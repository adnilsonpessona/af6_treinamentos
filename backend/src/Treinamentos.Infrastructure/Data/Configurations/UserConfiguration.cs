using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.CompanyId);
        builder.Property(u => u.FullName).IsRequired().HasMaxLength(200);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.Cpf).IsRequired().HasMaxLength(11);
        builder.HasIndex(u => u.Cpf).IsUnique();
        builder.Property(u => u.Department).IsRequired().HasMaxLength(100);
        builder.Property(u => u.JobTitle).IsRequired().HasMaxLength(100);
        builder.Property(u => u.Role).IsRequired();
        builder.Property(u => u.Status).IsRequired();
        builder.Property(u => u.PasswordHash).HasMaxLength(100);
        builder.Property(u => u.GoogleId).HasMaxLength(100);

        builder.HasOne(u => u.Company)
               .WithMany(c => c.Users)
               .HasForeignKey(u => u.CompanyId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
