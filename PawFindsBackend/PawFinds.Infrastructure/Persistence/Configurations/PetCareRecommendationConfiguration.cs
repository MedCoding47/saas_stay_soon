using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class PetCareRecommendationConfiguration : IEntityTypeConfiguration<PetCareRecommendation>
{
    public void Configure(EntityTypeBuilder<PetCareRecommendation> builder)
    {
        builder.ToTable("PetCareRecommendations");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(r => r.Description)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(r => r.TargetSpecies)
            .HasMaxLength(100);

        builder.Property(r => r.TargetAgeRange)
            .HasMaxLength(100);

        builder.HasOne(r => r.VeterinaireProfile)
            .WithMany(vp => vp.Recommendations)
            .HasForeignKey(r => r.VeterinaireProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => r.VeterinaireProfileId);
    }
}
