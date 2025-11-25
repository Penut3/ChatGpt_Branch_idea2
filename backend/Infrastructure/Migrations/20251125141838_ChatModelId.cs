using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChatModelId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ChatModelId",
                table: "Chats",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Chats_ChatModelId",
                table: "Chats",
                column: "ChatModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Chats_ChatModels_ChatModelId",
                table: "Chats",
                column: "ChatModelId",
                principalTable: "ChatModels",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Chats_ChatModels_ChatModelId",
                table: "Chats");

            migrationBuilder.DropIndex(
                name: "IX_Chats_ChatModelId",
                table: "Chats");

            migrationBuilder.DropColumn(
                name: "ChatModelId",
                table: "Chats");
        }
    }
}
