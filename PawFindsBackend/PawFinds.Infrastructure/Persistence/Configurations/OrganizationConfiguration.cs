using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.ToTable("Organizations");

        builder.HasKey(organization => organization.Id);

        builder.Property(organization => organization.Name)
            .HasMaxLength(160)
            .IsRequired();

        builder.Property(organization => organization.Slug)
            .HasMaxLength(120)
            .IsRequired();

        builder.HasIndex(organization => organization.Slug)
            .IsUnique();
    }
}
