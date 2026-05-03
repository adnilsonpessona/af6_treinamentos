using Treinamentos.Application.DTOs.Progress;
using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Enums;
using Treinamentos.Domain.Interfaces;

namespace Treinamentos.Application.Services;

public class ProgressService
{
    private readonly IUnitOfWork _uow;

    public ProgressService(IUnitOfWork uow) => _uow = uow;

    public async Task<VideoProgressResponse> UpdateVideoProgressAsync(
        Guid userId, UpdateVideoProgressRequest request)
    {
        var lesson = await _uow.Lessons.GetByIdAsync(request.LessonId)
            ?? throw new KeyNotFoundException("Aula não encontrada.");

        var progress = await _uow.VideoProgresses.GetByUserAndLessonAsync(userId, request.LessonId);
        var isNew = progress == null;

        if (isNew)
        {
            progress = new VideoProgress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                LessonId = request.LessonId,
                PercentageWatched = request.PercentageWatched,
                LastSecond = request.LastSecond,
                FirstAccessAt = DateTime.UtcNow,
                ViewSessions = 1
            };
            await _uow.VideoProgresses.AddAsync(progress);
        }
        else
        {
            // Incrementa sessão se o usuário voltou ao início (retomada)
            if (request.LastSecond < progress!.LastSecond - 5)
                progress.ViewSessions++;

            progress.PercentageWatched = Math.Max(progress.PercentageWatched, request.PercentageWatched);
            progress.LastSecond = request.LastSecond;
            _uow.VideoProgresses.Update(progress);
        }

        // Marcar como concluído se ≥ 90%
        if (request.PercentageWatched >= 90 && !progress.IsCompleted)
        {
            progress.IsCompleted = true;
            progress.CompletedAt = DateTime.UtcNow;
        }

        progress.UpdatedAt = DateTime.UtcNow;

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = AuditAction.VideoProgressUpdated,
            DetailsJson = $"{{\"lessonId\":\"{request.LessonId}\",\"percentage\":{request.PercentageWatched}}}"
        });

        await _uow.SaveChangesAsync();
        await CheckAndRecordCourseCompletionAsync(userId, lesson.CourseId);

        return new VideoProgressResponse(
            progress.LessonId, progress.PercentageWatched, progress.LastSecond,
            progress.IsCompleted, progress.ViewSessions, progress.FirstAccessAt, progress.CompletedAt);
    }

    public async Task RecordLessonTextAccessAsync(Guid userId, Guid lessonId)
    {
        await _uow.LessonAccesses.AddAsync(new LessonAccess
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            LessonId = lessonId,
            AccessedAt = DateTime.UtcNow
        });

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = AuditAction.LessonAccessed,
            DetailsJson = $"{{\"lessonId\":\"{lessonId}\"}}"
        });

        await _uow.SaveChangesAsync();

        var lesson = await _uow.Lessons.GetByIdAsync(lessonId);
        if (lesson != null)
            await CheckAndRecordCourseCompletionAsync(userId, lesson.CourseId);
    }

    public async Task<CourseProgressResponse> GetCourseProgressAsync(Guid userId, Guid courseId)
    {
        var course = await _uow.Courses.GetWithLessonsAsync(courseId)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        var lessonProgressList = new List<LessonProgressResponse>();
        var completedCount = 0;

        foreach (var lesson in course.Lessons.OrderBy(l => l.Order))
        {
            bool videoCompleted = false;
            bool textAccessed = false;
            decimal? videoPercentage = null;
            long? lastSecond = null;

            if (lesson.Type == LessonType.Video || lesson.Type == LessonType.VideoETexto)
            {
                var vp = await _uow.VideoProgresses.GetByUserAndLessonAsync(userId, lesson.Id);
                videoCompleted = vp?.IsCompleted ?? false;
                videoPercentage = vp?.PercentageWatched;
                lastSecond = vp?.LastSecond;
            }
            else
            {
                videoCompleted = true; // sem vídeo = não precisa
            }

            if (lesson.Type == LessonType.Texto || lesson.Type == LessonType.VideoETexto)
            {
                textAccessed = await _uow.LessonAccesses.AnyAsync(
                    a => a.UserId == userId && a.LessonId == lesson.Id);
            }
            else
            {
                textAccessed = true; // sem texto = não precisa
            }

            var lessonCompleted = videoCompleted && textAccessed;
            if (lessonCompleted) completedCount++;

            lessonProgressList.Add(new LessonProgressResponse(
                lesson.Id, lesson.Title, videoCompleted, textAccessed,
                lessonCompleted, videoPercentage, lastSecond));
        }

        var totalLessons = course.Lessons.Count;
        var percentage = totalLessons > 0
            ? Math.Round((decimal)completedCount / totalLessons * 100, 2)
            : 0;

        var completion = await _uow.CourseCompletions.FirstOrDefaultAsync(
            c => c.UserId == userId && c.CourseId == courseId);

        return new CourseProgressResponse(
            course.Id, course.Title, totalLessons, completedCount,
            percentage, completion != null, completion?.CompletedAt, lessonProgressList);
    }

    private async Task CheckAndRecordCourseCompletionAsync(Guid userId, Guid courseId)
    {
        // Já concluído?
        if (await _uow.CourseCompletions.AnyAsync(c => c.UserId == userId && c.CourseId == courseId))
            return;

        var course = await _uow.Courses.GetWithLessonsAsync(courseId);
        if (course == null || !course.Lessons.Any()) return;

        foreach (var lesson in course.Lessons)
        {
            bool videoOk = true, textOk = true;

            if (lesson.Type == LessonType.Video || lesson.Type == LessonType.VideoETexto)
            {
                var vp = await _uow.VideoProgresses.GetByUserAndLessonAsync(userId, lesson.Id);
                videoOk = vp?.IsCompleted ?? false;
            }

            if (lesson.Type == LessonType.Texto || lesson.Type == LessonType.VideoETexto)
            {
                textOk = await _uow.LessonAccesses.AnyAsync(
                    a => a.UserId == userId && a.LessonId == lesson.Id);
            }

            if (!videoOk || !textOk) return; // Alguma aula ainda não concluída
        }

        // Todas as aulas concluídas!
        await _uow.CourseCompletions.AddAsync(new CourseCompletion
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CourseId = courseId,
            CompletedAt = DateTime.UtcNow
        });
        await _uow.SaveChangesAsync();
    }
}
