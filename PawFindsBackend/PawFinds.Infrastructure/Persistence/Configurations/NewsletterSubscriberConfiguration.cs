using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class NewsletterSubscriberConfiguration : IEntityTypeConfiguration<NewsletterSubscriber>
{
    public void Configure(EntityTypeBuilder<NewsletterSubscriber> builder)
    {
        builder.ToTable("NewsletterSubscribers");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Email)
            .HasMaxLength(320)
            .IsRequired();

        builder.Property(s => s.Name)
            .HasMaxLength(200);

        builder.HasIndex(s => s.Email).IsUnique();
    }
}
