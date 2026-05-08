using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class AdoptionConfiguration : IEntityTypeConfiguration<Adoption>
{
    public void Configure(EntityTypeBuilder<Adoption> builder)
    {
        builder.ToTable("Adoptions");

        builder.HasKey(adoption => adoption.Id);

        builder.Property(adoption => adoption.Status)
            .HasConversion<string>()
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(adoption => adoption.ApplicationMessage)
            .HasMaxLength(2000);

        builder.Property(adoption => adoption.AdminNotes)
            .HasMaxLength(2000);

        builder.HasOne(adoption => adoption.Organization)
            .WithMany(organization => organization.Adoptions)
            .HasForeignKey(adoption => adoption.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(adoption => adoption.Pet)
            .WithMany()
            .HasForeignKey(adoption => adoption.PetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(adoption => adoption.Adopter)
            .WithMany()
            .HasForeignKey(adoption => adoption.AdopterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(adoption => adoption.OrganizationId);
        builder.HasIndex(adoption => adoption.Status);
        builder.HasIndex(adoption => new { adoption.OrganizationId, adoption.Status });
        builder.HasIndex(adoption => new { adoption.OrganizationId, adoption.PetId });
        builder.HasIndex(adoption => new { adoption.OrganizationId, adoption.AdopterId });
    }
}
