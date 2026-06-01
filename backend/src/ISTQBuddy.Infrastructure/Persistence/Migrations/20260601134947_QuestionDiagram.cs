using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ISTQBuddy.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class QuestionDiagram : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Diagram",
                table: "questions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Diagram",
                table: "questions");
        }
    }
}
