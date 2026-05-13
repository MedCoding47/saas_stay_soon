using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class AdoptRequestConfiguration : IEntityTypeConfiguration<AdoptRequest>
{
    public void Configure(EntityTypeBuilder<AdoptRequest> builder)
    {
        builder.ToTable("AdoptRequests");

        builder.HasKey(ar => ar.Id);

        builder.Property(ar => ar.PetName)
            .HasMaxLength(160)
            .IsRequired();

        builder.Property(ar => ar.Species)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(ar => ar.Breed)
            .HasMaxLength(120);

        builder.Property(ar => ar.Reason)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(ar => ar.Description)
            .HasMaxLength(2000);

        builder.Property(ar => ar.ContactPhone)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(ar => ar.ContactEmail)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(ar => ar.Status)
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(ar => ar.ImageUrls)
            .HasMaxLength(4000);

        builder.Property(ar => ar.AdminResponse)
            .HasMaxLength(2000);

        builder.HasOne(ar => ar.User)
            .WithMany(u => u.AdoptRequests)
            .HasForeignKey(ar => ar.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ar => ar.Organization)
            .WithMany()
            .HasForeignKey(ar => ar.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ar => ar.RespondedBy)
            .WithMany()
            .HasForeignKey(ar => ar.RespondedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(ar => ar.UserId);
        builder.HasIndex(ar => ar.OrganizationId);
        builder.HasIndex(ar => ar.Status);
    }
}
