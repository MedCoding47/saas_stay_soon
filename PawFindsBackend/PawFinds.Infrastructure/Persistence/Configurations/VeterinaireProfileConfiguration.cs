using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class VeterinaireProfileConfiguration : IEntityTypeConfiguration<VeterinaireProfile>
{
    public void Configure(EntityTypeBuilder<VeterinaireProfile> builder)
    {
        builder.ToTable("VeterinaireProfiles");

        builder.HasKey(vp => vp.Id);

        builder.Property(vp => vp.ClinicName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(vp => vp.Location)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(vp => vp.Phone)
            .HasMaxLength(20);

        builder.Property(vp => vp.Description)
            .HasMaxLength(2000);

        builder.HasOne(vp => vp.User)
            .WithOne(u => u.VeterinaireProfile)
            .HasForeignKey<VeterinaireProfile>(vp => vp.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(vp => vp.Organization)
            .WithMany()
            .HasForeignKey(vp => vp.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(vp => vp.UserId)
            .IsUnique();

        builder.HasIndex(vp => vp.OrganizationId);
    }
}
