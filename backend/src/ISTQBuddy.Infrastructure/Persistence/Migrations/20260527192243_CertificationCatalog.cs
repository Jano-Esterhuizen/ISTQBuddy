using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ISTQBuddy.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CertificationCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "certifications",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                // Valid enum string so the existing row materializes; the catalog seeder corrects it.
                defaultValue: "Core");

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "certifications",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "certifications",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_certifications_Slug",
                table: "certifications",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_certifications_Slug",
                table: "certifications");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "certifications");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "certifications");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "certifications");
        }
    }
}
