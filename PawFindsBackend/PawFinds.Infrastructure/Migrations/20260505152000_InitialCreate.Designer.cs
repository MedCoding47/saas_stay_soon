using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using PawFinds.Infrastructure.Persistence;

#nullable disable

namespace PawFinds.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260505152000_InitialCreate")]
partial class InitialCreate
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasAnnotation("ProductVersion", "8.0.11")
            .HasAnnotation("Relational:MaxIdentifierLength", 128);

        modelBuilder.Entity("PawFinds.Domain.Entities.Organization", b =>
        {
            b.Property<Guid>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("uniqueidentifier");

            b.Property<DateTimeOffset>("CreatedAt")
                .HasColumnType("datetimeoffset");

            b.Property<bool>("IsActive")
                .HasColumnType("bit");

            b.Property<string>("Name")
                .IsRequired()
                .HasMaxLength(160)
                .HasColumnType("nvarchar(160)");

            b.Property<string>("Slug")
                .IsRequired()
                .HasMaxLength(120)
                .HasColumnType("nvarchar(120)");

            b.Property<DateTimeOffset?>("UpdatedAt")
                .HasColumnType("datetimeoffset");

            b.HasKey("Id");

            b.HasIndex("Slug")
                .IsUnique();

            b.ToTable("Organizations");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.User", b =>
        {
            b.Property<Guid>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("uniqueidentifier");

            b.Property<DateTimeOffset>("CreatedAt")
                .HasColumnType("datetimeoffset");

            b.Property<string>("Email")
                .IsRequired()
                .HasMaxLength(256)
                .HasColumnType("nvarchar(256)");

            b.Property<string>("FullName")
                .IsRequired()
                .HasMaxLength(160)
                .HasColumnType("nvarchar(160)");

            b.Property<bool>("IsActive")
                .HasColumnType("bit");

            b.Property<Guid>("OrganizationId")
                .HasColumnType("uniqueidentifier");

            b.Property<string>("PasswordHash")
                .IsRequired()
                .HasMaxLength(512)
                .HasColumnType("nvarchar(512)");

            b.Property<string>("Role")
                .IsRequired()
                .HasMaxLength(40)
                .HasColumnType("nvarchar(40)");

            b.Property<DateTimeOffset?>("UpdatedAt")
                .HasColumnType("datetimeoffset");

            b.HasKey("Id");

            b.HasIndex("OrganizationId");

            b.HasIndex("OrganizationId", "Email")
                .IsUnique();

            b.ToTable("Users");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Pet", b =>
        {
            b.Property<Guid>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("uniqueidentifier");

            b.Property<int>("Age")
                .HasColumnType("int");

            b.Property<string>("Breed")
                .HasMaxLength(120)
                .HasColumnType("nvarchar(120)");

            b.Property<DateTimeOffset>("CreatedAt")
                .HasColumnType("datetimeoffset");

            b.Property<string>("Description")
                .HasColumnType("nvarchar(max)");

            b.Property<string>("ImageUrl")
                .HasMaxLength(500)
                .HasColumnType("nvarchar(500)");

            b.Property<string>("Location")
                .IsRequired()
                .HasMaxLength(160)
                .HasColumnType("nvarchar(160)");

            b.Property<string>("Name")
                .IsRequired()
                .HasMaxLength(160)
                .HasColumnType("nvarchar(160)");

            b.Property<Guid>("OrganizationId")
                .HasColumnType("uniqueidentifier");

            b.Property<string>("Status")
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnType("nvarchar(80)");

            b.Property<string>("Type")
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnType("nvarchar(80)");

            b.Property<DateTimeOffset?>("UpdatedAt")
                .HasColumnType("datetimeoffset");

            b.HasKey("Id");

            b.HasIndex("OrganizationId");

            b.HasIndex("Status");

            b.HasIndex("OrganizationId", "Status");

            b.HasIndex("OrganizationId", "Type");

            b.ToTable("Pets");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Adoption", b =>
        {
            b.Property<Guid>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("uniqueidentifier");

            b.Property<Guid>("AdopterId")
                .HasColumnType("uniqueidentifier");

            b.Property<string>("AdminNotes")
                .HasMaxLength(2000)
                .HasColumnType("nvarchar(2000)");

            b.Property<string>("ApplicationMessage")
                .HasMaxLength(2000)
                .HasColumnType("nvarchar(2000)");

            b.Property<DateTimeOffset?>("CompletedAt")
                .HasColumnType("datetimeoffset");

            b.Property<DateTimeOffset>("CreatedAt")
                .HasColumnType("datetimeoffset");

            b.Property<Guid>("OrganizationId")
                .HasColumnType("uniqueidentifier");

            b.Property<Guid>("PetId")
                .HasColumnType("uniqueidentifier");

            b.Property<string>("Status")
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnType("nvarchar(80)");

            b.Property<DateTimeOffset?>("UpdatedAt")
                .HasColumnType("datetimeoffset");

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
            b.Property<Guid>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("uniqueidentifier");

            b.Property<string>("Content")
                .IsRequired()
                .HasMaxLength(1000)
                .HasColumnType("nvarchar(1000)");

            b.Property<DateTimeOffset>("CreatedAt")
                .HasColumnType("datetimeoffset");

            b.Property<bool>("IsRead")
                .HasColumnType("bit");

            b.Property<Guid>("OrganizationId")
                .HasColumnType("uniqueidentifier");

            b.Property<DateTimeOffset?>("UpdatedAt")
                .HasColumnType("datetimeoffset");

            b.Property<Guid>("UserId")
                .HasColumnType("uniqueidentifier");

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
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            b.Navigation("Organization");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Pet", b =>
        {
            b.HasOne("PawFinds.Domain.Entities.Organization", "Organization")
                .WithMany("Pets")
                .HasForeignKey("OrganizationId")
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            b.Navigation("Organization");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Adoption", b =>
        {
            b.HasOne("PawFinds.Domain.Entities.User", "Adopter")
                .WithMany()
                .HasForeignKey("AdopterId")
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            b.HasOne("PawFinds.Domain.Entities.Organization", "Organization")
                .WithMany("Adoptions")
                .HasForeignKey("OrganizationId")
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            b.HasOne("PawFinds.Domain.Entities.Pet", "Pet")
                .WithMany()
                .HasForeignKey("PetId")
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            b.Navigation("Adopter");
            b.Navigation("Organization");
            b.Navigation("Pet");
        });

        modelBuilder.Entity("PawFinds.Domain.Entities.Notification", b =>
        {
            b.HasOne("PawFinds.Domain.Entities.Organization", "Organization")
                .WithMany()
                .HasForeignKey("OrganizationId")
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            b.HasOne("PawFinds.Domain.Entities.User", "User")
                .WithMany()
                .HasForeignKey("UserId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.Navigation("Organization");
            b.Navigation("User");
        });
    }
}
