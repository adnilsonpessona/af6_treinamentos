using Treinamentos.Domain.Enums;

namespace Treinamentos.Application.DTOs.Lessons;

public record CreateLessonRequest(string Title, int Order, LessonType Type, string? ContentHtml);
