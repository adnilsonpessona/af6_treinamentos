using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Treinamentos.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentsAndSimplifyCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "i_x_categories_department_parent_category_id_name",
                table: "categories");

            migrationBuilder.AlterColumn<string>(
                name: "department",
                table: "categories",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.CreateTable(
                name: "departments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_departments", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "i_x_categories_name_parent_category_id",
                table: "categories",
                columns: new[] { "name", "parent_category_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_departments_name",
                table: "departments",
                column: "name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "departments");

            migrationBuilder.DropIndex(
                name: "i_x_categories_name_parent_category_id",
                table: "categories");

            migrationBuilder.AlterColumn<string>(
                name: "department",
                table: "categories",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "i_x_categories_department_parent_category_id_name",
                table: "categories",
                columns: new[] { "department", "parent_category_id", "name" },
                unique: true);
        }
    }
}
