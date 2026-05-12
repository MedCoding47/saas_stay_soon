using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Status)
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(b => b.Notes)
            .HasMaxLength(1000);

        builder.HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.VeterinaireProfile)
            .WithMany(vp => vp.Bookings)
            .HasForeignKey(b => b.VeterinaireProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Pet)
            .WithMany(p => p.Bookings)
            .HasForeignKey(b => b.PetId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(b => b.UserId);
        builder.HasIndex(b => b.VeterinaireProfileId);
        builder.HasIndex(b => b.Status);
    }
}
