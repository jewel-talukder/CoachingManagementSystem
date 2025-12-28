using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSpecializationsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Specialization",
                table: "Teachers");

            migrationBuilder.AddColumn<int>(
                name: "SpecializationId",
                table: "Teachers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Specializations",
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
                    table.PrimaryKey("PK_Specializations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Specializations_Coachings_CoachingId",
                        column: x => x.CoachingId,
                        principalTable: "Coachings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Teachers_SpecializationId",
                table: "Teachers",
                column: "SpecializationId");

            migrationBuilder.CreateIndex(
                name: "IX_Specializations_CoachingId",
                table: "Specializations",
                column: "CoachingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Teachers_Specializations_SpecializationId",
                table: "Teachers",
                column: "SpecializationId",
                principalTable: "Specializations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teachers_Specializations_SpecializationId",
                table: "Teachers");

            migrationBuilder.DropTable(
                name: "Specializations");

            migrationBuilder.DropIndex(
                name: "IX_Teachers_SpecializationId",
                table: "Teachers");

            migrationBuilder.DropColumn(
                name: "SpecializationId",
                table: "Teachers");

            migrationBuilder.AddColumn<string>(
                name: "Specialization",
                table: "Teachers",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
