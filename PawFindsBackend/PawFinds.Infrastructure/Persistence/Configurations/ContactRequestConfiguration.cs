using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class ContactRequestConfiguration : IEntityTypeConfiguration<ContactRequest>
{
    public void Configure(EntityTypeBuilder<ContactRequest> builder)
    {
        builder.ToTable("ContactRequests");

        builder.HasKey(cr => cr.Id);

        builder.Property(cr => cr.Subject)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(cr => cr.Message)
            .HasMaxLength(2000)
            .IsRequired();

        builder.HasOne(cr => cr.Organization)
            .WithMany(o => o.ContactRequests)
            .HasForeignKey(cr => cr.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cr => cr.User)
            .WithMany()
            .HasForeignKey(cr => cr.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(cr => cr.OrganizationId);
        builder.HasIndex(cr => cr.UserId);
    }
}
