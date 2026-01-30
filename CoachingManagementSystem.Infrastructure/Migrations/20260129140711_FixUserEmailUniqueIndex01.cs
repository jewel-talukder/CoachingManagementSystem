using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixUserEmailUniqueIndex01 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Students_BranchId_StudentCode",
                table: "Students");

            migrationBuilder.CreateIndex(
                name: "IX_Students_BranchId_StudentCode",
                table: "Students",
                columns: new[] { "BranchId", "StudentCode" },
                unique: true,
                filter: "[StudentCode] IS NOT NULL AND [StudentCode] <> ''");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Students_BranchId_StudentCode",
                table: "Students");

            migrationBuilder.CreateIndex(
                name: "IX_Students_BranchId_StudentCode",
                table: "Students",
                columns: new[] { "BranchId", "StudentCode" },
                unique: true,
                filter: "[StudentCode] IS NOT NULL");
        }
    }
}
