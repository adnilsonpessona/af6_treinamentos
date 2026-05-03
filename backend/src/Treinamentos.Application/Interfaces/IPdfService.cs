namespace Treinamentos.Application.Interfaces;

public interface IPdfService
{
    byte[] GenerateLessonPdf(string lessonTitle, string contentHtml, string courseTitle);
}
