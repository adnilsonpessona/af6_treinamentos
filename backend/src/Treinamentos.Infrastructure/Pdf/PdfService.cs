using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Treinamentos.Application.Interfaces;

namespace Treinamentos.Infrastructure.Pdf;

public class PdfService : IPdfService
{
    public PdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateLessonPdf(string lessonTitle, string contentHtml, string courseTitle)
    {
        // Strip HTML tags for basic text content
        var plainText = System.Text.RegularExpressions.Regex.Replace(contentHtml, "<[^>]+>", " ");
        plainText = System.Net.WebUtility.HtmlDecode(plainText);
        plainText = System.Text.RegularExpressions.Regex.Replace(plainText, @"\s+", " ").Trim();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                page.Header().Column(col =>
                {
                    col.Item().Text(courseTitle)
                        .FontSize(13).SemiBold().FontColor(Colors.Grey.Darken2);
                    col.Item().PaddingTop(4).Text(lessonTitle)
                        .FontSize(18).Bold();
                    col.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                });

                page.Content().PaddingTop(20).Text(plainText).FontSize(11).LineHeight(1.5f);

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Página ");
                    x.CurrentPageNumber();
                    x.Span(" de ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }
}
