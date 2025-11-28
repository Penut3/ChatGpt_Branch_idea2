using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Grid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "GridId",
                table: "Chats",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Grids",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grids", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Chats_GridId",
                table: "Chats",
                column: "GridId");

            migrationBuilder.AddForeignKey(
                name: "FK_Chats_Grids_GridId",
                table: "Chats",
                column: "GridId",
                principalTable: "Grids",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Chats_Grids_GridId",
                table: "Chats");

            migrationBuilder.DropTable(
                name: "Grids");

            migrationBuilder.DropIndex(
                name: "IX_Chats_GridId",
                table: "Chats");

            migrationBuilder.DropColumn(
                name: "GridId",
                table: "Chats");
        }
    }
}
