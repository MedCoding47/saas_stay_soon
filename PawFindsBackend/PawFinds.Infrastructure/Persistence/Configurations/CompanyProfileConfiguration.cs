using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class CompanyProfileConfiguration : IEntityTypeConfiguration<CompanyProfile>
{
    public void Configure(EntityTypeBuilder<CompanyProfile> builder)
    {
        builder.ToTable("CompanyProfiles");

        builder.HasKey(cp => cp.Id);

        builder.Property(cp => cp.CompanyName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(cp => cp.Description)
            .HasMaxLength(2000);

        builder.Property(cp => cp.LogoUrl)
            .HasMaxLength(500);

        builder.Property(cp => cp.Location)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(cp => cp.Phone)
            .HasMaxLength(20);

        builder.Property(cp => cp.Email)
            .HasMaxLength(256);

        builder.Property(cp => cp.Website)
            .HasMaxLength(500);

        builder.HasOne(cp => cp.Organization)
            .WithOne()
            .HasForeignKey<CompanyProfile>(cp => cp.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(cp => cp.OrganizationId)
            .IsUnique();
    }
}
