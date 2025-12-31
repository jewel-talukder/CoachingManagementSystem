using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBranchIdToPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add BranchId column to Payments table (nullable first to handle existing data)
            migrationBuilder.AddColumn<int>(
                name: "BranchId",
                table: "Payments",
                type: "int",
                nullable: true);

            // Update existing payments with BranchId from their associated Student
            migrationBuilder.Sql(@"
                UPDATE p
                SET p.BranchId = s.BranchId
                FROM Payments p
                INNER JOIN Students s ON p.StudentId = s.Id
                WHERE p.BranchId IS NULL
            ");

            // Make BranchId required (not nullable) after updating existing data
            migrationBuilder.AlterColumn<int>(
                name: "BranchId",
                table: "Payments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Add foreign key constraint
            migrationBuilder.CreateIndex(
                name: "IX_Payments_BranchId",
                table: "Payments",
                column: "BranchId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Branches_BranchId",
                table: "Payments",
                column: "BranchId",
                principalTable: "Branches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Branches_BranchId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_BranchId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "Payments");
        }
    }
}
