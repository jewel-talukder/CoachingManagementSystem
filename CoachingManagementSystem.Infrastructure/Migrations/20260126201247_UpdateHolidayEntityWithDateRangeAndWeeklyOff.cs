using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateHolidayEntityWithDateRangeAndWeeklyOff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "HolidayDate",
                table: "Holidays",
                newName: "StartDate");

            migrationBuilder.AddColumn<string>(
                name: "DaysOfWeek",
                table: "Holidays",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "Holidays",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HolidayType",
                table: "Holidays",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DaysOfWeek",
                table: "Holidays");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Holidays");

            migrationBuilder.DropColumn(
                name: "HolidayType",
                table: "Holidays");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Holidays",
                newName: "HolidayDate");
        }
    }
}
