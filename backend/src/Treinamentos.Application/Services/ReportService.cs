using Treinamentos.Application.DTOs.Reports;
using Treinamentos.Domain.Enums;
using Treinamentos.Domain.Interfaces;

namespace Treinamentos.Application.Services;

public class ReportService
{
    private readonly IUnitOfWork _uow;

    public ReportService(IUnitOfWork uow) => _uow = uow;

    public async Task<AdminReportResponse> GetAdminReportAsync(
        string? department, string? courseId, DateTime? from, DateTime? to)
    {
        var users = await _uow.Users.GetAllAsync();
        var courses = await _uow.Courses.GetAllAsync();
        var sessions = await _uow.UserSessions.GetAllAsync();
        var completions = await _uow.CourseCompletions.GetAllAsync();
        var videoProgresses = await _uow.VideoProgresses.GetAllAsync();
        var lessonAccesses = await _uow.LessonAccesses.GetAllAsync();

        if (!string.IsNullOrEmpty(department))
            users = users.Where(u => u.Department == department);

        var neverLoggedIn = users.Count(u => !sessions.Any(s => s.UserId == u.Id));

        var publishedCourses = courses.Where(c => c.Status == CourseStatus.Publicado).ToList();

        var progressItems = new List<UserCourseProgressItem>();

        foreach (var user in users.Where(u => u.Status == UserStatus.Active))
        {
            foreach (var course in publishedCourses)
            {
                if (!string.IsNullOrEmpty(courseId) && course.Id.ToString() != courseId)
                    continue;

                var lessons = await _uow.Lessons.FindAsync(l => l.CourseId == course.Id);
                var totalLessons = lessons.Count();
                if (totalLessons == 0) continue;

                var completedLessons = 0;
                DateTime? lastAccess = null;

                foreach (var lesson in lessons)
                {
                    bool videoOk = lesson.Type == LessonType.Texto;
                    bool textOk = lesson.Type == LessonType.Video;

                    if (lesson.Type == LessonType.Video || lesson.Type == LessonType.VideoETexto)
                    {
                        var vp = videoProgresses.FirstOrDefault(
                            v => v.UserId == user.Id && v.LessonId == lesson.Id);
                        videoOk = vp?.IsCompleted ?? false;
                        if (vp != null && (lastAccess == null || vp.UpdatedAt > lastAccess))
                            lastAccess = vp.UpdatedAt;
                    }
                    if (lesson.Type == LessonType.Texto || lesson.Type == LessonType.VideoETexto)
                    {
                        var la = lessonAccesses
                            .Where(a => a.UserId == user.Id && a.LessonId == lesson.Id)
                            .OrderByDescending(a => a.AccessedAt).FirstOrDefault();
                        textOk = la != null;
                        if (la != null && (lastAccess == null || la.AccessedAt > lastAccess))
                            lastAccess = la.AccessedAt;
                    }

                    if (videoOk && textOk) completedLessons++;
                }

                var pct = totalLessons > 0
                    ? Math.Round((decimal)completedLessons / totalLessons * 100, 2) : 0;

                var completion = completions.FirstOrDefault(
                    c => c.UserId == user.Id && c.CourseId == course.Id);

                if (from.HasValue && lastAccess.HasValue && lastAccess < from) continue;
                if (to.HasValue && lastAccess.HasValue && lastAccess > to) continue;

                progressItems.Add(new UserCourseProgressItem(
                    user.Id, user.FullName, user.Department, user.JobTitle,
                    course.Id, course.Title, pct, completion != null,
                    completion?.CompletedAt, lastAccess));
            }
        }

        var mostAccessed = videoProgresses
            .GroupBy(v => v.LessonId)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .Select(g => g.Key.ToString())
            .ToList();

        return new AdminReportResponse(
            users.Count(), publishedCourses.Count, neverLoggedIn,
            progressItems, mostAccessed);
    }

    public async Task<ManagerReportResponse> GetManagerReportAsync(Guid managerId)
    {
        var manager = await _uow.Users.GetByIdAsync(managerId)
            ?? throw new KeyNotFoundException("Gestor não encontrado.");

        var adminReport = await GetAdminReportAsync(manager.Department, null, null, null);

        return new ManagerReportResponse(
            manager.Department,
            adminReport.TotalUsers,
            adminReport.UserProgress);
    }

    public async Task<IEnumerable<InstructorReportResponse>> GetInstructorReportAsync(Guid instructorId)
    {
        var courses = await _uow.Courses.GetByInstructorAsync(instructorId);
        var result = new List<InstructorReportResponse>();

        foreach (var course in courses)
        {
            var completions = await _uow.CourseCompletions.FindAsync(c => c.CourseId == course.Id);
            var lessons = await _uow.Lessons.FindAsync(l => l.CourseId == course.Id);
            var allUsers = await _uow.Users.GetAllAsync();
            var videoProgresses = await _uow.VideoProgresses.GetAllAsync();
            var lessonAccesses = await _uow.LessonAccesses.GetAllAsync();

            // Usuários que acessaram o curso
            var studentIds = videoProgresses
                .Where(vp => lessons.Any(l => l.Id == vp.LessonId))
                .Select(vp => vp.UserId)
                .Union(lessonAccesses
                    .Where(la => lessons.Any(l => l.Id == la.LessonId))
                    .Select(la => la.UserId))
                .Distinct()
                .ToList();

            var studentProgress = new List<UserCourseProgressItem>();
            foreach (var uid in studentIds)
            {
                var user = allUsers.FirstOrDefault(u => u.Id == uid);
                if (user == null) continue;

                var completedLessons = 0;
                DateTime? lastAccess = null;

                foreach (var lesson in lessons)
                {
                    bool videoOk = lesson.Type == LessonType.Texto;
                    bool textOk = lesson.Type == LessonType.Video;

                    if (lesson.Type != LessonType.Texto)
                    {
                        var vp = videoProgresses.FirstOrDefault(v => v.UserId == uid && v.LessonId == lesson.Id);
                        videoOk = vp?.IsCompleted ?? false;
                        if (vp != null && (lastAccess == null || vp.UpdatedAt > lastAccess))
                            lastAccess = vp.UpdatedAt;
                    }
                    if (lesson.Type != LessonType.Video)
                    {
                        var la = lessonAccesses
                            .Where(a => a.UserId == uid && a.LessonId == lesson.Id)
                            .OrderByDescending(a => a.AccessedAt).FirstOrDefault();
                        textOk = la != null;
                        if (la != null && (lastAccess == null || la.AccessedAt > lastAccess))
                            lastAccess = la.AccessedAt;
                    }

                    if (videoOk && textOk) completedLessons++;
                }

                var pct = lessons.Any()
                    ? Math.Round((decimal)completedLessons / lessons.Count() * 100, 2) : 0;
                var comp = completions.FirstOrDefault(c => c.UserId == uid);

                studentProgress.Add(new UserCourseProgressItem(
                    uid, user.FullName, user.Department, user.JobTitle,
                    course.Id, course.Title, pct, comp != null, comp?.CompletedAt, lastAccess));
            }

            var lessonStats = lessons.Select(lesson =>
            {
                var accesses = lessonAccesses.Count(a => a.LessonId == lesson.Id) +
                               videoProgresses.Count(v => v.LessonId == lesson.Id);
                var completed = videoProgresses.Count(v => v.LessonId == lesson.Id && v.IsCompleted);
                var total = videoProgresses.Count(v => v.LessonId == lesson.Id);
                var pct = total > 0 ? Math.Round((decimal)completed / total * 100, 2) : 0;
                return new LessonAccessStat(lesson.Id, lesson.Title, accesses, pct);
            });

            result.Add(new InstructorReportResponse(
                course.Id, course.Title,
                studentIds.Count, completions.Count(),
                studentProgress, lessonStats));
        }

        return result;
    }

    public async Task<MyProgressResponse> GetMyProgressAsync(Guid userId, string department, Guid? companyId)
    {
        var availableCourses = await _uow.Courses.GetPublishedForUserAsync(userId, department, companyId);
        var completions = await _uow.CourseCompletions.FindAsync(c => c.UserId == userId);
        var videoProgresses = await _uow.VideoProgresses.FindAsync(v => v.UserId == userId);
        var lessonAccesses = await _uow.LessonAccesses.FindAsync(a => a.UserId == userId);

        var courseItems = new List<MyCourseProgress>();
        var started = 0;

        foreach (var course in availableCourses)
        {
            var lessons = await _uow.Lessons.FindAsync(l => l.CourseId == course.Id);
            var totalLessons = lessons.Count();
            var completedLessons = 0;
            DateTime? lastAccess = null;

            foreach (var lesson in lessons)
            {
                bool videoOk = lesson.Type == LessonType.Texto;
                bool textOk = lesson.Type == LessonType.Video;

                if (lesson.Type != LessonType.Texto)
                {
                    var vp = videoProgresses.FirstOrDefault(v => v.LessonId == lesson.Id);
                    videoOk = vp?.IsCompleted ?? false;
                    if (vp != null && (lastAccess == null || vp.UpdatedAt > lastAccess))
                        lastAccess = vp.UpdatedAt;
                }
                if (lesson.Type != LessonType.Video)
                {
                    var la = lessonAccesses
                        .Where(a => a.LessonId == lesson.Id)
                        .OrderByDescending(a => a.AccessedAt).FirstOrDefault();
                    textOk = la != null;
                    if (la != null && (lastAccess == null || la.AccessedAt > lastAccess))
                        lastAccess = la.AccessedAt;
                }

                if (videoOk && textOk) completedLessons++;
            }

            var pct = totalLessons > 0
                ? Math.Round((decimal)completedLessons / totalLessons * 100, 2) : 0;

            if (pct > 0) started++;

            var comp = completions.FirstOrDefault(c => c.CourseId == course.Id);
            var category = await _uow.Categories.GetByIdAsync(course.CategoryId);

            courseItems.Add(new MyCourseProgress(
                course.Id, course.Title, category?.Name ?? "",
                pct, comp != null, comp?.CompletedAt, lastAccess));
        }

        return new MyProgressResponse(
            availableCourses.Count(), started, completions.Count(), courseItems);
    }
}
