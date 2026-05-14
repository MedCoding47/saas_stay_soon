using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PawFinds.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPetHealthBehavior : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BehaviorNotes",
                table: "Pets",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "GoodWithCats",
                table: "Pets",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "GoodWithDogs",
                table: "Pets",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "GoodWithKids",
                table: "Pets",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HealthNotes",
                table: "Pets",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDewormed",
                table: "Pets",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSterilized",
                table: "Pets",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsVaccinated",
                table: "Pets",
                type: "bit",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BehaviorNotes",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "GoodWithCats",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "GoodWithDogs",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "GoodWithKids",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "HealthNotes",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "IsDewormed",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "IsSterilized",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "IsVaccinated",
                table: "Pets");
        }
    }
}
