using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PawFinds.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPetCareRecommendations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PetCareRecommendations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VeterinaireProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    TargetSpecies = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TargetAgeRange = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetCareRecommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PetCareRecommendations_VeterinaireProfiles_VeterinaireProfileId",
                        column: x => x.VeterinaireProfileId,
                        principalTable: "VeterinaireProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PetCareRecommendations_VeterinaireProfileId",
                table: "PetCareRecommendations",
                column: "VeterinaireProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PetCareRecommendations");
        }
    }
}
