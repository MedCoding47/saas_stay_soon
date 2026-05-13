using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PawFinds.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAdoptRequestImageUrls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrls",
                table: "AdoptRequests",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrls",
                table: "AdoptRequests");
        }
    }
}
