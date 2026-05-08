using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class PetConfiguration : IEntityTypeConfiguration<Pet>
{
    public void Configure(EntityTypeBuilder<Pet> builder)
    {
        builder.ToTable("Pets");

        builder.HasKey(pet => pet.Id);

        builder.Property(pet => pet.Name)
            .HasMaxLength(160)
            .IsRequired();

        builder.Property(pet => pet.Breed)
            .HasMaxLength(120);

        builder.Property(pet => pet.Type)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(pet => pet.Location)
            .HasMaxLength(160)
            .IsRequired();

        builder.Property(pet => pet.ImageUrl)
            .HasMaxLength(500);

        builder.Property(pet => pet.Status)
            .HasConversion<string>()
            .HasMaxLength(80)
            .IsRequired();

        builder.HasOne(pet => pet.Organization)
            .WithMany(organization => organization.Pets)
            .HasForeignKey(pet => pet.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(pet => pet.OrganizationId);
        builder.HasIndex(pet => pet.Status);
        builder.HasIndex(pet => new { pet.OrganizationId, pet.Status });
        builder.HasIndex(pet => new { pet.OrganizationId, pet.Type });
    }
}
