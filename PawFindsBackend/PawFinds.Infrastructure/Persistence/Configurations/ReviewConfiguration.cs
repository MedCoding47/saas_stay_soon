using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Rating)
            .IsRequired();

        builder.Property(r => r.Comment)
            .HasMaxLength(500);

        builder.HasOne(r => r.Author)
            .WithMany()
            .HasForeignKey(r => r.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.VeterinaireProfile)
            .WithMany(vp => vp.Reviews)
            .HasForeignKey(r => r.VeterinaireProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.CompanyProfile)
            .WithMany(cp => cp.Reviews)
            .HasForeignKey(r => r.CompanyProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Booking)
            .WithMany()
            .HasForeignKey(r => r.BookingId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(r => r.VeterinaireProfileId);
        builder.HasIndex(r => r.CompanyProfileId);
        builder.HasIndex(r => new { r.AuthorId, r.BookingId }).IsUnique();
    }
}
