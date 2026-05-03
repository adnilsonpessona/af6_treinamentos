using Microsoft.Extensions.Configuration;
using Treinamentos.Application.DTOs.Courses;
using Treinamentos.Application.DTOs.Lessons;
using Treinamentos.Application.Interfaces;
using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Enums;
using Treinamentos.Domain.Interfaces;

namespace Treinamentos.Application.Services;

public class CourseService
{
    private readonly IUnitOfWork _uow;
    private readonly IEmailService _emailService;
    private readonly string _appBaseUrl;

    public CourseService(IUnitOfWork uow, IEmailService emailService, IConfiguration config)
    {
        _uow = uow;
        _emailService = emailService;
        _appBaseUrl = config["App:BaseUrl"] ?? "http://localhost:3000";
    }

    // ── Cursos ────────────────────────────────────────────────────────

    public async Task<CourseResponse> CreateCourseAsync(CreateCourseRequest request, Guid instructorId)
    {
        var company = await _uow.Companies.GetByIdAsync(request.CompanyId)
            ?? throw new KeyNotFoundException("Empresa não encontrada.");

        if (!company.IsActive)
            throw new InvalidOperationException("Empresa inativa.");

        var category = await _uow.Categories.GetByIdAsync(request.CategoryId)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        if (!category.IsActive)
            throw new InvalidOperationException("Categoria inativa.");

        if (category.ParentCategoryId.HasValue)
            throw new InvalidOperationException("Selecione uma categoria principal válida.");

        var subCategory = await _uow.Categories.GetByIdAsync(request.SubCategoryId)
            ?? throw new KeyNotFoundException("Subcategoria não encontrada.");

        if (!subCategory.IsActive)
            throw new InvalidOperationException("Subcategoria inativa.");

        if (subCategory.ParentCategoryId != category.Id)
            throw new InvalidOperationException("Subcategoria não pertence à categoria informada.");

        var course = new Course
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            CompanyId = request.CompanyId,
            Department = request.Department,
            CategoryId = request.CategoryId,
            SubCategoryId = request.SubCategoryId,
            AvailableForAllCompanies = request.AvailableForAllCompanies,
            AvailableForAllDepartments = request.AvailableForAllDepartments,
            InstructorId = instructorId,
            Status = CourseStatus.Rascunho
        };

        await _uow.Courses.AddAsync(course);
        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = instructorId,
            Action = AuditAction.CourseCreated,
            DetailsJson = $"{{\"courseId\":\"{course.Id}\"}}"
        });
        await _uow.SaveChangesAsync();

        return await ToCourseResponseAsync(course);
    }

    public async Task<IEnumerable<CourseResponse>> GetCoursesAsync(Guid userId, string userRole, string department, Guid? companyId)
    {
        IEnumerable<Course> courses;

        if (userRole == "Administrador")
            courses = await _uow.Courses.GetAllAsync();
        else if (userRole == "Instrutor")
            courses = await _uow.Courses.GetByInstructorAsync(userId);
        else
            courses = await _uow.Courses.GetPublishedForUserAsync(userId, department, companyId);

        var results = new List<CourseResponse>();
        foreach (var course in courses)
            results.Add(await ToCourseResponseAsync(course));
        return results;
    }

    public async Task<CourseDetailResponse> GetCourseDetailAsync(Guid id, Guid userId, string userRole, string department, Guid? companyId)
    {
        var course = await _uow.Courses.GetWithLessonsAsync(id)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        if (userRole != "Administrador" && userRole != "Instrutor" && course.Status != CourseStatus.Publicado)
            throw new UnauthorizedAccessException("Curso não disponível.");

        if (userRole != "Administrador" && userRole != "Instrutor" && !CanAccessCourse(course, department, companyId))
            throw new UnauthorizedAccessException("Curso não disponível para sua empresa/departamento.");

        return new CourseDetailResponse(
            course.Id,
            course.Title,
            course.Description,
            course.CompanyId,
            course.Company?.NomeFantasia ?? "",
            course.Department,
            course.CategoryId,
            course.Category?.Name ?? "",
            course.SubCategoryId,
            course.SubCategory?.Name ?? "",
            course.AvailableForAllCompanies,
            course.AvailableForAllDepartments,
            course.ThumbnailPath,
            course.Status,
            course.InstructorId, course.Instructor?.FullName ?? "",
            course.Lessons.OrderBy(l => l.Order).Select(ToLessonResponse),
            course.CreatedAt, course.UpdatedAt);
    }

    public async Task<CourseResponse> UpdateCourseAsync(Guid id, UpdateCourseRequest request, Guid instructorId, string role)
    {
        var course = await _uow.Courses.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        if (role == "Instrutor" && course.InstructorId != instructorId)
            throw new UnauthorizedAccessException("Sem permissão para editar este curso.");

        var company = await _uow.Companies.GetByIdAsync(request.CompanyId)
            ?? throw new KeyNotFoundException("Empresa não encontrada.");

        if (!company.IsActive)
            throw new InvalidOperationException("Empresa inativa.");

        var category = await _uow.Categories.GetByIdAsync(request.CategoryId)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        if (!category.IsActive)
            throw new InvalidOperationException("Categoria inativa.");

        if (category.ParentCategoryId.HasValue)
            throw new InvalidOperationException("Selecione uma categoria principal válida.");

        var subCategory = await _uow.Categories.GetByIdAsync(request.SubCategoryId)
            ?? throw new KeyNotFoundException("Subcategoria não encontrada.");

        if (!subCategory.IsActive)
            throw new InvalidOperationException("Subcategoria inativa.");

        if (subCategory.ParentCategoryId != category.Id)
            throw new InvalidOperationException("Subcategoria não pertence à categoria informada.");

        // Editar curso publicado retorna ao rascunho
        if (course.Status == CourseStatus.Publicado)
            course.Status = CourseStatus.Rascunho;

        course.Title = request.Title;
        course.Description = request.Description;
        course.CompanyId = request.CompanyId;
        course.Department = request.Department;
        course.CategoryId = request.CategoryId;
        course.SubCategoryId = request.SubCategoryId;
        course.AvailableForAllCompanies = request.AvailableForAllCompanies;
        course.AvailableForAllDepartments = request.AvailableForAllDepartments;
        course.UpdatedAt = DateTime.UtcNow;
        _uow.Courses.Update(course);

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = instructorId,
            Action = AuditAction.CourseEdited,
            DetailsJson = $"{{\"courseId\":\"{id}\"}}"
        });
        await _uow.SaveChangesAsync();

        return await ToCourseResponseAsync(course);
    }

    public async Task UpdateThumbnailAsync(Guid courseId, string thumbnailPath, Guid userId)
    {
        var course = await _uow.Courses.GetByIdAsync(courseId)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        course.ThumbnailPath = thumbnailPath;
        course.UpdatedAt = DateTime.UtcNow;
        _uow.Courses.Update(course);
        await _uow.SaveChangesAsync();
    }

    public async Task SubmitForApprovalAsync(Guid id, Guid instructorId)
    {
        var course = await _uow.Courses.GetWithLessonsAsync(id)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        if (course.InstructorId != instructorId)
            throw new UnauthorizedAccessException("Sem permissão.");

        if (course.Status != CourseStatus.Rascunho && course.Status != CourseStatus.Reprovado)
            throw new InvalidOperationException($"Curso no status '{course.Status}' não pode ser enviado para aprovação.");

        if (!course.Lessons.Any())
            throw new InvalidOperationException("O curso deve ter ao menos uma aula antes de ser enviado para aprovação.");

        var lessonsMissingVideo = course.Lessons
            .Where(l => (l.Type == LessonType.Video || l.Type == LessonType.VideoETexto) && string.IsNullOrWhiteSpace(l.VideoPath))
            .OrderBy(l => l.Order)
            .Select(l => $"{l.Order}. {l.Title}")
            .ToList();

        if (lessonsMissingVideo.Count > 0)
        {
            var lessonList = string.Join(", ", lessonsMissingVideo);
            throw new InvalidOperationException($"Aula de vídeo sem arquivo enviado: {lessonList}. Envie os vídeos antes de solicitar aprovação.");
        }

        course.Status = CourseStatus.AguardandoAprovacao;
        course.UpdatedAt = DateTime.UtcNow;
        _uow.Courses.Update(course);

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = instructorId,
            Action = AuditAction.CourseSubmitted,
            DetailsJson = $"{{\"courseId\":\"{id}\"}}"
        });
        await _uow.SaveChangesAsync();
    }

    public async Task ApproveCourseAsync(Guid id, Guid adminId)
    {
        var course = await _uow.Courses.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        if (course.Status != CourseStatus.AguardandoAprovacao)
            throw new InvalidOperationException("Curso não está aguardando aprovação.");

        course.Status = CourseStatus.Publicado;
        course.UpdatedAt = DateTime.UtcNow;
        _uow.Courses.Update(course);

        await _uow.CourseApprovals.AddAsync(new CourseApproval
        {
            CourseId = id,
            AdminId = adminId,
            Decision = CourseStatus.Publicado
        });

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = adminId,
            Action = AuditAction.CourseApproved,
            DetailsJson = $"{{\"courseId\":\"{id}\"}}"
        });
        await _uow.SaveChangesAsync();
    }

    public async Task RejectCourseAsync(Guid id, string comment, Guid adminId)
    {
        var course = await _uow.Courses.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        if (course.Status != CourseStatus.AguardandoAprovacao)
            throw new InvalidOperationException("Curso não está aguardando aprovação.");

        course.Status = CourseStatus.Rascunho;
        course.UpdatedAt = DateTime.UtcNow;
        _uow.Courses.Update(course);

        await _uow.CourseApprovals.AddAsync(new CourseApproval
        {
            CourseId = id,
            AdminId = adminId,
            Decision = CourseStatus.Reprovado,
            Comment = comment
        });

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = adminId,
            Action = AuditAction.CourseRejected,
            DetailsJson = $"{{\"courseId\":\"{id}\",\"comment\":\"{comment}\"}}"
        });
        await _uow.SaveChangesAsync();
    }

    public async Task SetPermissionsAsync(Guid courseId, SetCoursePermissionsRequest request, Guid adminId)
    {
        var course = await _uow.Courses.GetByIdAsync(courseId)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        // Remove permissões atuais
        var deptPerms = await _uow.CourseDepartmentPermissions.FindAsync(p => p.CourseId == courseId);
        foreach (var p in deptPerms) _uow.CourseDepartmentPermissions.Remove(p);

        var userPerms = await _uow.CourseUserPermissions.FindAsync(p => p.CourseId == courseId);
        foreach (var p in userPerms) _uow.CourseUserPermissions.Remove(p);

        // Adiciona novas permissões
        foreach (var dept in request.Departments)
            await _uow.CourseDepartmentPermissions.AddAsync(new CourseDepartmentPermission
            { CourseId = courseId, Department = dept });

        foreach (var uid in request.UserIds)
            await _uow.CourseUserPermissions.AddAsync(new CourseUserPermission
            { CourseId = courseId, UserId = uid });

        await _uow.AuditLogs.AddAsync(new AuditLog
        {
            UserId = adminId,
            Action = AuditAction.CoursePermissionsChanged,
            DetailsJson = $"{{\"courseId\":\"{courseId}\"}}"
        });

        await _uow.SaveChangesAsync();

        // Notificar usuários se solicitado
        if (request.NotifyUsers)
        {
            var usersToNotify = new List<User>();

            foreach (var dept in request.Departments)
            {
                var deptUsers = await _uow.Users.GetByDepartmentAsync(dept);
                usersToNotify.AddRange(deptUsers.Where(u => u.Status == UserStatus.Active));
            }

            foreach (var uid in request.UserIds)
            {
                var u = await _uow.Users.GetByIdAsync(uid);
                if (u != null && u.Status == UserStatus.Active)
                    usersToNotify.Add(u);
            }

            var courseLink = $"{_appBaseUrl}/courses/{courseId}";
            foreach (var user in usersToNotify.DistinctBy(u => u.Id))
            {
                _ = _emailService.SendNewCourseEmailAsync(
                    user.Email, user.FullName,
                    course.Title, course.Description, courseLink);
            }
        }
    }

    // ── Aulas ─────────────────────────────────────────────────────────

    public async Task<LessonResponse> CreateLessonAsync(Guid courseId, CreateLessonRequest request, Guid instructorId)
    {
        var course = await _uow.Courses.GetByIdAsync(courseId)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        if (course.InstructorId != instructorId)
            throw new UnauthorizedAccessException("Sem permissão para editar este curso.");

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            Title = request.Title,
            Order = request.Order,
            Type = request.Type,
            ContentHtml = request.ContentHtml
        };

        await _uow.Lessons.AddAsync(lesson);
        course.UpdatedAt = DateTime.UtcNow;
        _uow.Courses.Update(course);
        await _uow.SaveChangesAsync();

        return ToLessonResponse(lesson);
    }

    public async Task<LessonResponse> UpdateLessonAsync(Guid courseId, Guid lessonId, UpdateLessonRequest request, Guid instructorId)
    {
        var course = await _uow.Courses.GetByIdAsync(courseId)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        if (course.InstructorId != instructorId)
            throw new UnauthorizedAccessException("Sem permissão.");

        var lesson = await _uow.Lessons.GetByIdAsync(lessonId)
            ?? throw new KeyNotFoundException("Aula não encontrada.");

        lesson.Title = request.Title;
        lesson.Order = request.Order;
        lesson.Type = request.Type;
        lesson.ContentHtml = request.ContentHtml;
        lesson.UpdatedAt = DateTime.UtcNow;
        _uow.Lessons.Update(lesson);

        course.UpdatedAt = DateTime.UtcNow;
        _uow.Courses.Update(course);
        await _uow.SaveChangesAsync();

        return ToLessonResponse(lesson);
    }

    public async Task DeleteLessonAsync(Guid courseId, Guid lessonId, Guid instructorId)
    {
        var course = await _uow.Courses.GetByIdAsync(courseId)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        if (course.InstructorId != instructorId)
            throw new UnauthorizedAccessException("Sem permissão.");

        var lesson = await _uow.Lessons.GetByIdAsync(lessonId)
            ?? throw new KeyNotFoundException("Aula não encontrada.");

        _uow.Lessons.Remove(lesson);
        course.UpdatedAt = DateTime.UtcNow;
        _uow.Courses.Update(course);
        await _uow.SaveChangesAsync();
    }

    public async Task UpdateLessonVideoPathAsync(Guid lessonId, string videoPath, long durationSeconds)
    {
        var lesson = await _uow.Lessons.GetByIdAsync(lessonId)
            ?? throw new KeyNotFoundException("Aula não encontrada.");

        lesson.VideoPath = videoPath;
        lesson.VideoDurationSeconds = durationSeconds;
        lesson.UpdatedAt = DateTime.UtcNow;
        _uow.Lessons.Update(lesson);
        await _uow.SaveChangesAsync();
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private async Task<CourseResponse> ToCourseResponseAsync(Course course)
    {
        var lessonCount = await _uow.Lessons.CountAsync(l => l.CourseId == course.Id);
        var category = course.Category ?? await _uow.Categories.GetByIdAsync(course.CategoryId);
        var subCategory = course.SubCategory ?? await _uow.Categories.GetByIdAsync(course.SubCategoryId);
        var company = course.Company ?? await _uow.Companies.GetByIdAsync(course.CompanyId);
        var instructor = course.Instructor ?? await _uow.Users.GetByIdAsync(course.InstructorId);
        return new CourseResponse(
            course.Id,
            course.Title,
            course.Description,
            course.CompanyId,
            company?.NomeFantasia ?? "",
            course.Department,
            course.CategoryId,
            category?.Name ?? "",
            course.SubCategoryId,
            subCategory?.Name ?? "",
            course.AvailableForAllCompanies,
            course.AvailableForAllDepartments,
            course.ThumbnailPath,
            course.Status,
            course.InstructorId, instructor?.FullName ?? "",
            lessonCount, course.CreatedAt, course.UpdatedAt);
    }

    private static bool CanAccessCourse(Course course, string department, Guid? companyId)
    {
        var allowedCompany = course.AvailableForAllCompanies || (companyId.HasValue && course.CompanyId == companyId.Value);
        var allowedDepartment = course.AvailableForAllDepartments || string.Equals(course.Department, department, StringComparison.OrdinalIgnoreCase);
        return allowedCompany && allowedDepartment;
    }

    private static LessonResponse ToLessonResponse(Lesson l) => new(
        l.Id, l.CourseId, l.Title, l.Order, l.Type,
        !string.IsNullOrEmpty(l.VideoPath), !string.IsNullOrEmpty(l.ContentHtml),
        l.VideoDurationSeconds, l.ContentHtml, l.CreatedAt);

    public async Task DeleteCourseAsync(Guid id, Guid userId, string role)
    {
        var course = await _uow.Courses.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        if (role == "Instrutor" && course.InstructorId != userId)
            throw new UnauthorizedAccessException("Sem permissão para excluir este curso.");

        // Check for video progress or lesson accesses
        var lessons = await _uow.Lessons.FindAsync(l => l.CourseId == id);
        var lessonIds = lessons.Select(l => l.Id).ToList();

        bool hasWatched = false;
        if (lessonIds.Count > 0)
        {
            hasWatched = await _uow.VideoProgresses.AnyAsync(vp => lessonIds.Contains(vp.LessonId))
                      || await _uow.LessonAccesses.AnyAsync(la => lessonIds.Contains(la.LessonId));
        }

        if (hasWatched)
            throw new InvalidOperationException("WATCHED");

        // Remove related records
        var courseApprovals = await _uow.CourseApprovals.FindAsync(a => a.CourseId == id);
        foreach (var a in courseApprovals) _uow.CourseApprovals.Remove(a);

        var deptPerms = await _uow.CourseDepartmentPermissions.FindAsync(p => p.CourseId == id);
        foreach (var p in deptPerms) _uow.CourseDepartmentPermissions.Remove(p);

        var userPerms = await _uow.CourseUserPermissions.FindAsync(p => p.CourseId == id);
        foreach (var p in userPerms) _uow.CourseUserPermissions.Remove(p);

        foreach (var lesson in lessons) _uow.Lessons.Remove(lesson);

        _uow.Courses.Remove(course);
        await _uow.SaveChangesAsync();
    }

    public async Task ArchiveCourseAsync(Guid id, Guid userId, string role)
    {
        var course = await _uow.Courses.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Curso não encontrado.");

        if (role == "Instrutor" && course.InstructorId != userId)
            throw new UnauthorizedAccessException("Sem permissão para arquivar este curso.");

        course.Status = CourseStatus.Arquivado;
        course.UpdatedAt = DateTime.UtcNow;
        _uow.Courses.Update(course);
        await _uow.SaveChangesAsync();
    }
}
