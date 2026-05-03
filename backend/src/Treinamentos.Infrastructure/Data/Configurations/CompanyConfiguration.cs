using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Treinamentos.Domain.Entities;

namespace Treinamentos.Infrastructure.Data.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Empresa).IsRequired();
        builder.Property(c => c.Revenda).IsRequired();
        builder.Property(c => c.RazaoSocial).IsRequired().HasMaxLength(200);
        builder.Property(c => c.NomeFantasia).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Cnpj).IsRequired().HasMaxLength(14);
        builder.Property(c => c.IsActive).IsRequired();

        builder.HasIndex(c => c.Cnpj).IsUnique();
        builder.HasIndex(c => new { c.Empresa, c.Revenda }).IsUnique();
    }
}
