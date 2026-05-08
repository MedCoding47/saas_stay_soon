using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PawFinds.Infrastructure.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Organizations",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                Name = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                Slug = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Organizations", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                FullName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                PasswordHash = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                Role = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Users", x => x.Id);
                table.ForeignKey(
                    name: "FK_Users_Organizations_OrganizationId",
                    column: x => x.OrganizationId,
                    principalTable: "Organizations",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Pets",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                Breed = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                Age = table.Column<int>(type: "int", nullable: false),
                Type = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                Location = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Pets", x => x.Id);
                table.ForeignKey(
                    name: "FK_Pets_Organizations_OrganizationId",
                    column: x => x.OrganizationId,
                    principalTable: "Organizations",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Adoptions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                PetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                AdopterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                ApplicationMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                AdminNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                CompletedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Adoptions", x => x.Id);
                table.ForeignKey(
                    name: "FK_Adoptions_Organizations_OrganizationId",
                    column: x => x.OrganizationId,
                    principalTable: "Organizations",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Adoptions_Pets_PetId",
                    column: x => x.PetId,
                    principalTable: "Pets",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Adoptions_Users_AdopterId",
                    column: x => x.AdopterId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Notifications",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Content = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                IsRead = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Notifications", x => x.Id);
                table.ForeignKey(
                    name: "FK_Notifications_Organizations_OrganizationId",
                    column: x => x.OrganizationId,
                    principalTable: "Organizations",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Notifications_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Organizations_Slug",
            table: "Organizations",
            column: "Slug",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Users_OrganizationId",
            table: "Users",
            column: "OrganizationId");

        migrationBuilder.CreateIndex(
            name: "IX_Users_OrganizationId_Email",
            table: "Users",
            columns: new[] { "OrganizationId", "Email" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Pets_OrganizationId",
            table: "Pets",
            column: "OrganizationId");

        migrationBuilder.CreateIndex(
            name: "IX_Pets_Status",
            table: "Pets",
            column: "Status");

        migrationBuilder.CreateIndex(
            name: "IX_Pets_OrganizationId_Status",
            table: "Pets",
            columns: new[] { "OrganizationId", "Status" });

        migrationBuilder.CreateIndex(
            name: "IX_Pets_OrganizationId_Type",
            table: "Pets",
            columns: new[] { "OrganizationId", "Type" });

        migrationBuilder.CreateIndex(
            name: "IX_Adoptions_OrganizationId",
            table: "Adoptions",
            column: "OrganizationId");

        migrationBuilder.CreateIndex(
            name: "IX_Adoptions_Status",
            table: "Adoptions",
            column: "Status");

        migrationBuilder.CreateIndex(
            name: "IX_Adoptions_OrganizationId_Status",
            table: "Adoptions",
            columns: new[] { "OrganizationId", "Status" });

        migrationBuilder.CreateIndex(
            name: "IX_Adoptions_OrganizationId_PetId",
            table: "Adoptions",
            columns: new[] { "OrganizationId", "PetId" });

        migrationBuilder.CreateIndex(
            name: "IX_Adoptions_OrganizationId_AdopterId",
            table: "Adoptions",
            columns: new[] { "OrganizationId", "AdopterId" });

        migrationBuilder.CreateIndex(
            name: "IX_Adoptions_PetId",
            table: "Adoptions",
            column: "PetId");

        migrationBuilder.CreateIndex(
            name: "IX_Adoptions_AdopterId",
            table: "Adoptions",
            column: "AdopterId");

        migrationBuilder.CreateIndex(
            name: "IX_Notifications_OrganizationId",
            table: "Notifications",
            column: "OrganizationId");

        migrationBuilder.CreateIndex(
            name: "IX_Notifications_OrganizationId_UserId_IsRead",
            table: "Notifications",
            columns: new[] { "OrganizationId", "UserId", "IsRead" });

        migrationBuilder.CreateIndex(
            name: "IX_Notifications_UserId",
            table: "Notifications",
            column: "UserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Adoptions");
        migrationBuilder.DropTable(name: "Notifications");
        migrationBuilder.DropTable(name: "Pets");
        migrationBuilder.DropTable(name: "Users");
        migrationBuilder.DropTable(name: "Organizations");
    }
}
