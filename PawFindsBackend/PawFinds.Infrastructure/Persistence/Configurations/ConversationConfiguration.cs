using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence.Configurations;

public sealed class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.ToTable("Conversations");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.IsOpen)
            .IsRequired();

        builder.HasOne(c => c.Organization)
            .WithMany(o => o.Conversations)
            .HasForeignKey(c => c.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Pet)
            .WithMany(p => p.Conversations)
            .HasForeignKey(c => c.PetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.PetHolder)
            .WithMany(u => u.ConversationsAsPetHolder)
            .HasForeignKey(c => c.PetHolderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Adopter)
            .WithMany(u => u.ConversationsAsAdopter)
            .HasForeignKey(c => c.AdopterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.OrganizationId);
        builder.HasIndex(c => c.PetId);
        builder.HasIndex(c => c.PetHolderId);
        builder.HasIndex(c => c.AdopterId);
    }
}
