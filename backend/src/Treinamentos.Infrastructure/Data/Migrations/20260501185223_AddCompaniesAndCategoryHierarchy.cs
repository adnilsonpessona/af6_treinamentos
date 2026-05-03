using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Treinamentos.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCompaniesAndCategoryHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "i_x_categories_name",
                table: "categories");

            migrationBuilder.AddColumn<Guid>(
                name: "company_id",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "available_for_all_companies",
                table: "courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "available_for_all_departments",
                table: "courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "company_id",
                table: "courses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "department",
                table: "courses",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "sub_category_id",
                table: "courses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "department",
                table: "categories",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "parent_category_id",
                table: "categories",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "companies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    empresa = table.Column<int>(type: "integer", nullable: false),
                    revenda = table.Column<int>(type: "integer", nullable: false),
                    razao_social = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    nome_fantasia = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    cnpj = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_companies", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "i_x_users_company_id",
                table: "users",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "i_x_courses_company_id",
                table: "courses",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "i_x_courses_sub_category_id",
                table: "courses",
                column: "sub_category_id");

            migrationBuilder.CreateIndex(
                name: "i_x_categories_department_parent_category_id_name",
                table: "categories",
                columns: new[] { "department", "parent_category_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_categories_parent_category_id",
                table: "categories",
                column: "parent_category_id");

            migrationBuilder.CreateIndex(
                name: "i_x_companies_cnpj",
                table: "companies",
                column: "cnpj",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_companies_empresa_revenda",
                table: "companies",
                columns: new[] { "empresa", "revenda" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "f_k_categories_categories_parent_category_id",
                table: "categories",
                column: "parent_category_id",
                principalTable: "categories",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_courses_categories_sub_category_id",
                table: "courses",
                column: "sub_category_id",
                principalTable: "categories",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_courses_companies_company_id",
                table: "courses",
                column: "company_id",
                principalTable: "companies",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "f_k_users_companies_company_id",
                table: "users",
                column: "company_id",
                principalTable: "companies",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "f_k_categories_categories_parent_category_id",
                table: "categories");

            migrationBuilder.DropForeignKey(
                name: "f_k_courses_categories_sub_category_id",
                table: "courses");

            migrationBuilder.DropForeignKey(
                name: "f_k_courses_companies_company_id",
                table: "courses");

            migrationBuilder.DropForeignKey(
                name: "f_k_users_companies_company_id",
                table: "users");

            migrationBuilder.DropTable(
                name: "companies");

            migrationBuilder.DropIndex(
                name: "i_x_users_company_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "i_x_courses_company_id",
                table: "courses");

            migrationBuilder.DropIndex(
                name: "i_x_courses_sub_category_id",
                table: "courses");

            migrationBuilder.DropIndex(
                name: "i_x_categories_department_parent_category_id_name",
                table: "categories");

            migrationBuilder.DropIndex(
                name: "i_x_categories_parent_category_id",
                table: "categories");

            migrationBuilder.DropColumn(
                name: "company_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "available_for_all_companies",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "available_for_all_departments",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "company_id",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "department",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "sub_category_id",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "department",
                table: "categories");

            migrationBuilder.DropColumn(
                name: "parent_category_id",
                table: "categories");

            migrationBuilder.CreateIndex(
                name: "i_x_categories_name",
                table: "categories",
                column: "name",
                unique: true);
        }
    }
}
