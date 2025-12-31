using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePaymentBranchId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmploymentType",
                table: "Teachers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Salary",
                table: "Teachers",
                type: "decimal(18,2)",
                nullable: true);
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
                name: "EmploymentType",
                table: "Teachers");

            migrationBuilder.DropColumn(
                name: "Salary",
                table: "Teachers");
        }
    }
}
