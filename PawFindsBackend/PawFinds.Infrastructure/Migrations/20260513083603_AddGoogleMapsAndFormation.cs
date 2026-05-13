using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PawFinds.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleMapsAndFormation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Formation",
                table: "VeterinaireProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleMapsUrl",
                table: "VeterinaireProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleMapsUrl",
                table: "CompanyProfiles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Formation",
                table: "VeterinaireProfiles");

            migrationBuilder.DropColumn(
                name: "GoogleMapsUrl",
                table: "VeterinaireProfiles");

            migrationBuilder.DropColumn(
                name: "GoogleMapsUrl",
                table: "CompanyProfiles");
        }
    }
}
