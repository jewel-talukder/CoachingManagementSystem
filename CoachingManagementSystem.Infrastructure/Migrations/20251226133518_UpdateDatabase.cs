using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Teachers_CoachingId_EmployeeCode",
                table: "Teachers");

            migrationBuilder.DropIndex(
                name: "IX_Students_CoachingId_StudentCode",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Courses_CoachingId_Code",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Batches_CoachingId_Code",
                table: "Batches");

            migrationBuilder.AddColumn<int>(
                name: "BranchId",
                table: "Teachers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BranchId",
                table: "Students",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BranchId",
                table: "Enrollments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BranchId",
                table: "Courses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BranchId",
                table: "Batches",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Branches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CoachingId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ZipCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Branches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Branches_Coachings_CoachingId",
                        column: x => x.CoachingId,
                        principalTable: "Coachings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Teachers_BranchId_EmployeeCode",
                table: "Teachers",
                columns: new[] { "BranchId", "EmployeeCode" },
                unique: true,
                filter: "[EmployeeCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Teachers_CoachingId",
                table: "Teachers",
                column: "CoachingId");

            migrationBuilder.CreateIndex(
                name: "IX_Students_BranchId_StudentCode",
                table: "Students",
                columns: new[] { "BranchId", "StudentCode" },
                unique: true,
                filter: "[StudentCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Students_CoachingId",
                table: "Students",
                column: "CoachingId");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_BranchId",
                table: "Enrollments",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_BranchId_Code",
                table: "Courses",
                columns: new[] { "BranchId", "Code" },
                unique: true,
                filter: "[Code] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_CoachingId",
                table: "Courses",
                column: "CoachingId");

            migrationBuilder.CreateIndex(
                name: "IX_Batches_BranchId_Code",
                table: "Batches",
                columns: new[] { "BranchId", "Code" },
                unique: true,
                filter: "[Code] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Batches_CoachingId",
                table: "Batches",
                column: "CoachingId");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_CoachingId_Code",
                table: "Branches",
                columns: new[] { "CoachingId", "Code" },
                unique: true,
                filter: "[Code] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Batches_Branches_BranchId",
                table: "Batches",
                column: "BranchId",
                principalTable: "Branches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Branches_BranchId",
                table: "Courses",
                column: "BranchId",
                principalTable: "Branches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_Branches_BranchId",
                table: "Enrollments",
                column: "BranchId",
                principalTable: "Branches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Students_Branches_BranchId",
                table: "Students",
                column: "BranchId",
                principalTable: "Branches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Teachers_Branches_BranchId",
                table: "Teachers",
                column: "BranchId",
                principalTable: "Branches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Batches_Branches_BranchId",
                table: "Batches");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Branches_BranchId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_Branches_BranchId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Students_Branches_BranchId",
                table: "Students");

            migrationBuilder.DropForeignKey(
                name: "FK_Teachers_Branches_BranchId",
                table: "Teachers");

            migrationBuilder.DropTable(
                name: "Branches");

            migrationBuilder.DropIndex(
                name: "IX_Teachers_BranchId_EmployeeCode",
                table: "Teachers");

            migrationBuilder.DropIndex(
                name: "IX_Teachers_CoachingId",
                table: "Teachers");

            migrationBuilder.DropIndex(
                name: "IX_Students_BranchId_StudentCode",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Students_CoachingId",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Enrollments_BranchId",
                table: "Enrollments");

            migrationBuilder.DropIndex(
                name: "IX_Courses_BranchId_Code",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_CoachingId",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Batches_BranchId_Code",
                table: "Batches");

            migrationBuilder.DropIndex(
                name: "IX_Batches_CoachingId",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "Teachers");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "Batches");

            migrationBuilder.CreateIndex(
                name: "IX_Teachers_CoachingId_EmployeeCode",
                table: "Teachers",
                columns: new[] { "CoachingId", "EmployeeCode" },
                unique: true,
                filter: "[EmployeeCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Students_CoachingId_StudentCode",
                table: "Students",
                columns: new[] { "CoachingId", "StudentCode" },
                unique: true,
                filter: "[StudentCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_CoachingId_Code",
                table: "Courses",
                columns: new[] { "CoachingId", "Code" },
                unique: true,
                filter: "[Code] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Batches_CoachingId_Code",
                table: "Batches",
                columns: new[] { "CoachingId", "Code" },
                unique: true,
                filter: "[Code] IS NOT NULL");
        }
    }
}
