using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class AdviceConfiguration : IEntityTypeConfiguration<Advice>
{
    public void Configure(EntityTypeBuilder<Advice> builder)
    {
        builder.ToTable("Advice");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(a => a.Content)
            .HasMaxLength(5000)
            .IsRequired();

        builder.HasOne(a => a.VeterinaireProfile)
            .WithMany(vp => vp.AdviceList)
            .HasForeignKey(a => a.VeterinaireProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => a.VeterinaireProfileId);
    }
}
