using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class supabaseUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Chats_Chats_ParentChatId",
                table: "Chats");

            migrationBuilder.AddColumn<string>(
                name: "SupabaseId",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Chats_Chats_ParentChatId",
                table: "Chats",
                column: "ParentChatId",
                principalTable: "Chats",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Chats_Chats_ParentChatId",
                table: "Chats");

            migrationBuilder.DropColumn(
                name: "SupabaseId",
                table: "Users");

            migrationBuilder.AddForeignKey(
                name: "FK_Chats_Chats_ParentChatId",
                table: "Chats",
                column: "ParentChatId",
                principalTable: "Chats",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
