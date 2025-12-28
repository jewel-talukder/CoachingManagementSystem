using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQualificationsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Qualification",
                table: "Teachers");

            migrationBuilder.AddColumn<int>(
                name: "QualificationId",
                table: "Teachers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Qualifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CoachingId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Qualifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Qualifications_Coachings_CoachingId",
                        column: x => x.CoachingId,
                        principalTable: "Coachings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Teachers_QualificationId",
                table: "Teachers",
                column: "QualificationId");

            migrationBuilder.CreateIndex(
                name: "IX_Qualifications_CoachingId",
                table: "Qualifications",
                column: "CoachingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Teachers_Qualifications_QualificationId",
                table: "Teachers",
                column: "QualificationId",
                principalTable: "Qualifications",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teachers_Qualifications_QualificationId",
                table: "Teachers");

            migrationBuilder.DropTable(
                name: "Qualifications");

            migrationBuilder.DropIndex(
                name: "IX_Teachers_QualificationId",
                table: "Teachers");

            migrationBuilder.DropColumn(
                name: "QualificationId",
                table: "Teachers");

            migrationBuilder.AddColumn<string>(
                name: "Qualification",
                table: "Teachers",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
