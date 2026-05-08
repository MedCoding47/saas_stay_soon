using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(notification => notification.Id);

        builder.Property(notification => notification.Content)
            .HasMaxLength(1000)
            .IsRequired();

        builder.HasOne(notification => notification.Organization)
            .WithMany()
            .HasForeignKey(notification => notification.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(notification => notification.User)
            .WithMany()
            .HasForeignKey(notification => notification.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(notification => notification.OrganizationId);
        builder.HasIndex(notification => new { notification.OrganizationId, notification.UserId, notification.IsRead });
    }
}
