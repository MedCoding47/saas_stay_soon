using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PawFinds.Infrastructure.Persistence;

#nullable disable

namespace PawFinds.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
partial class AppDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasAnnotation("ProductVersion", "8.0.11");

        modelBuilder.Entity("PawFinds.Domain.Entities.Organization", b =>
        {
            b.Property<Guid>("Id").ValueGeneratedOnAdd();
            b.Property<DateTimeOffset>("CreatedAt");
            b.Property<bool>("IsActive");
            b.Property<string>("Name").IsRequired().HasMaxLength(160);
            b.Property<string>("Slug").IsRequired().HasMaxLength(120);
            b.Property<DateTimeOffset?>("UpdatedAt");
            b.HasKey("Id");
            b.HasIndex("Slug").IsUnique();
            b.ToTable("Organizations");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.User", b =>
        {
            b.Property<Guid>("Id").ValueGeneratedOnAdd();
            b.Property<DateTimeOffset>("CreatedAt");
            b.Property<string>("Email").IsRequired().HasMaxLength(256);
            b.Property<string>("FullName").IsRequired().HasMaxLength(160);
            b.Property<bool>("IsActive");
            b.Property<Guid>("OrganizationId");
            b.Property<string>("PasswordHash").IsRequired().HasMaxLength(512);
            b.Property<string>("Role").IsRequired().HasMaxLength(40);
            b.Property<DateTimeOffset?>("UpdatedAt");
            b.HasKey("Id");
            b.HasIndex("OrganizationId");
            b.HasIndex("OrganizationId", "Email").IsUnique();
            b.ToTable("Users");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Pet", b =>
        {
            b.Property<Guid>("Id").ValueGeneratedOnAdd();
            b.Property<int>("Age");
            b.Property<string>("Breed").HasMaxLength(120);
            b.Property<DateTimeOffset>("CreatedAt");
            b.Property<string>("Description");
            b.Property<string>("ImageUrl").HasMaxLength(500);
            b.Property<string>("Location").IsRequired().HasMaxLength(160);
            b.Property<string>("Name").IsRequired().HasMaxLength(160);
            b.Property<Guid>("OrganizationId");
            b.Property<string>("Status").IsRequired().HasMaxLength(80);
            b.Property<string>("Type").IsRequired().HasMaxLength(80);
            b.Property<DateTimeOffset?>("UpdatedAt");
            b.HasKey("Id");
            b.HasIndex("OrganizationId");
            b.HasIndex("Status");
            b.HasIndex("OrganizationId", "Status");
            b.HasIndex("OrganizationId", "Type");
            b.ToTable("Pets");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Adoption", b =>
        {
            b.Property<Guid>("Id").ValueGeneratedOnAdd();
            b.Property<Guid>("AdopterId");
            b.Property<string>("AdminNotes").HasMaxLength(2000);
            b.Property<string>("ApplicationMessage").HasMaxLength(2000);
            b.Property<DateTimeOffset?>("CompletedAt");
            b.Property<DateTimeOffset>("CreatedAt");
            b.Property<Guid>("OrganizationId");
            b.Property<Guid>("PetId");
            b.Property<string>("Status").IsRequired().HasMaxLength(80);
            b.Property<DateTimeOffset?>("UpdatedAt");
            b.HasKey("Id");
            b.HasIndex("OrganizationId");
            b.HasIndex("Status");
            b.HasIndex("OrganizationId", "Status");
            b.HasIndex("OrganizationId", "PetId");
            b.HasIndex("OrganizationId", "AdopterId");
            b.HasIndex("PetId");
            b.HasIndex("AdopterId");
            b.ToTable("Adoptions");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Notification", b =>
        {
            b.Property<Guid>("Id").ValueGeneratedOnAdd();
            b.Property<string>("Content").IsRequired().HasMaxLength(1000);
            b.Property<DateTimeOffset>("CreatedAt");
            b.Property<bool>("IsRead");
            b.Property<Guid>("OrganizationId");
            b.Property<DateTimeOffset?>("UpdatedAt");
            b.Property<Guid>("UserId");
            b.HasKey("Id");
            b.HasIndex("OrganizationId");
            b.HasIndex("OrganizationId", "UserId", "IsRead");
            b.HasIndex("UserId");
            b.ToTable("Notifications");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.User", b =>
        {
            b.HasOne("PawFinds.Domain.Entities.Organization", "Organization")
                .WithMany("Users")
                .HasForeignKey("OrganizationId")
                .OnDelete(DeleteBehavior.Restrict);

            b.Navigation("Organization");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Pet", b =>
        {
            b.HasOne("PawFinds.Domain.Entities.Organization", "Organization")
                .WithMany("Pets")
                .HasForeignKey("OrganizationId")
                .OnDelete(DeleteBehavior.Restrict);

            b.Navigation("Organization");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Adoption", b =>
        {
            b.HasOne("PawFinds.Domain.Entities.Organization", "Organization")
                .WithMany("Adoptions")
                .HasForeignKey("OrganizationId")
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne("PawFinds.Domain.Entities.User", "Adopter")
                .WithMany()
                .HasForeignKey("AdopterId")
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne("PawFinds.Domain.Entities.Pet", "Pet")
                .WithMany()
                .HasForeignKey("PetId")
                .OnDelete(DeleteBehavior.Restrict);

            b.Navigation("Adopter");
            b.Navigation("Organization");
            b.Navigation("Pet");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Notification", b =>
        {
            b.HasOne("PawFinds.Domain.Entities.Organization", "Organization")
                .WithMany()
                .HasForeignKey("OrganizationId")
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne("PawFinds.Domain.Entities.User", "User")
                .WithMany()
                .HasForeignKey("UserId")
                .OnDelete(DeleteBehavior.Cascade);

            b.Navigation("Organization");
            b.Navigation("User");
        });
    }
}
