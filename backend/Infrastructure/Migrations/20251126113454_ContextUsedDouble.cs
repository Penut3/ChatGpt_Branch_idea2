using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ContextUsedDouble : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContextHealth",
                table: "Chats");

            migrationBuilder.AddColumn<double>(
                name: "ContextUsed",
                table: "Chats",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContextUsed",
                table: "Chats");

            migrationBuilder.AddColumn<int>(
                name: "ContextHealth",
                table: "Chats",
                type: "integer",
                nullable: true);
        }
    }
}
