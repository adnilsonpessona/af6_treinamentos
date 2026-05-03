using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Treinamentos.Application.DTOs.Courses;
using Treinamentos.Application.DTOs.Lessons;
using Treinamentos.Application.Interfaces;
using Treinamentos.Application.Services;

namespace Treinamentos.API.Controllers;

[ApiController]
[Route("api/v1/courses")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly CourseService _courseService;
    private readonly IStorageService _storage;
    private readonly IPdfService _pdfService;
    private readonly Treinamentos.Domain.Interfaces.IUnitOfWork _uow;
    private readonly IJwtService _jwtService;

    public CoursesController(CourseService courseService, IStorageService storage, IPdfService pdfService, Treinamentos.Domain.Interfaces.IUnitOfWork uow, IJwtService jwtService)
    {
        _courseService = courseService;
        _storage = storage;
        _pdfService = pdfService;
        _uow = uow;
        _jwtService = jwtService;
    }

    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);
    private string CurrentRole => User.FindFirstValue(ClaimTypes.Role) ?? "";
    private string CurrentDepartment => User.FindFirstValue("department") ?? "";
    private Guid? CurrentCompanyId => Guid.TryParse(User.FindFirstValue("companyId"), out var id) ? id : null;

    // ── Cursos ─────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var courses = await _courseService.GetCoursesAsync(CurrentUserId, CurrentRole, CurrentDepartment, CurrentCompanyId);
        return Ok(courses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var course = await _courseService.GetCourseDetailAsync(id, CurrentUserId, CurrentRole, CurrentDepartment, CurrentCompanyId);
            return Ok(course);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpPost]
    [Authorize(Roles = "Instrutor,Administrador")]
    public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
    {
        try
        {
            var course = await _courseService.CreateCourseAsync(request, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { id = course.Id }, course);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Instrutor,Administrador")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCourseRequest request)
    {
        try
        {
            var course = await _courseService.UpdateCourseAsync(id, request, CurrentUserId, CurrentRole);
            return Ok(course);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("{id}/thumbnail")]
    [Authorize(Roles = "Instrutor,Administrador")]
    public async Task<IActionResult> UploadThumbnail(Guid id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Arquivo inválido." });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowed.Contains(file.ContentType))
            return BadRequest(new { message = "Formato de imagem não permitido. Use JPEG, PNG ou WebP." });

        using var stream = file.OpenReadStream();
        var path = await _storage.SaveThumbnailAsync(stream, file.FileName);
        await _courseService.UpdateThumbnailAsync(id, path, CurrentUserId);
        return Ok(new { thumbnailPath = path });
    }

    [HttpPost("{id}/submit")]
    [Authorize(Roles = "Instrutor,Administrador")]
    public async Task<IActionResult> Submit(Guid id)
    {
        try
        {
            await _courseService.SubmitForApprovalAsync(id, CurrentUserId);
            return Ok(new { message = "Curso enviado para aprovação." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Approve(Guid id)
    {
        try
        {
            await _courseService.ApproveCourseAsync(id, CurrentUserId);
            return Ok(new { message = "Curso aprovado e publicado." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectCourseRequest request)
    {
        try
        {
            await _courseService.RejectCourseAsync(id, request.Comment, CurrentUserId);
            return Ok(new { message = "Curso reprovado." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id}/permissions")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> SetPermissions(Guid id, [FromBody] SetCoursePermissionsRequest request)
    {
        try
        {
            await _courseService.SetPermissionsAsync(id, request, CurrentUserId);
            return Ok(new { message = "Permissões atualizadas." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    // ── Aulas ──────────────────────────────────────

    [HttpPost("{courseId}/lessons")]
    [Authorize(Roles = "Instrutor,Administrador")]
    public async Task<IActionResult> CreateLesson(Guid courseId, [FromBody] CreateLessonRequest request)
    {
        try
        {
            var lesson = await _courseService.CreateLessonAsync(courseId, request, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { id = courseId }, lesson);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpPut("{courseId}/lessons/{lessonId}")]
    [Authorize(Roles = "Instrutor,Administrador")]
    public async Task<IActionResult> UpdateLesson(Guid courseId, Guid lessonId, [FromBody] UpdateLessonRequest request)
    {
        try
        {
            var lesson = await _courseService.UpdateLessonAsync(courseId, lessonId, request, CurrentUserId);
            return Ok(lesson);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpDelete("{courseId}/lessons/{lessonId}")]
    [Authorize(Roles = "Instrutor,Administrador")]
    public async Task<IActionResult> DeleteLesson(Guid courseId, Guid lessonId)
    {
        try
        {
            await _courseService.DeleteLessonAsync(courseId, lessonId, CurrentUserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpPost("{courseId}/lessons/{lessonId}/video")]
    [Authorize(Roles = "Instrutor,Administrador")]
    [RequestSizeLimit(2_000_000_000)] // 2GB
    [RequestFormLimits(MultipartBodyLengthLimit = 2_000_000_000)] // 2GB multipart limit
    public async Task<IActionResult> UploadVideo(Guid courseId, Guid lessonId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Arquivo inválido." });

        var extension = Path.GetExtension(file.FileName);
        var validExtension = string.Equals(extension, ".mp4", StringComparison.OrdinalIgnoreCase);
        var validContentType = string.Equals(file.ContentType, "video/mp4", StringComparison.OrdinalIgnoreCase)
            || string.Equals(file.ContentType, "application/octet-stream", StringComparison.OrdinalIgnoreCase);
        if (!validExtension || !validContentType)
            return BadRequest(new { message = "Apenas arquivos MP4 são aceitos." });

        using var stream = file.OpenReadStream();
        var path = await _storage.SaveVideoAsync(stream, file.FileName);
        await _courseService.UpdateLessonVideoPathAsync(lessonId, path, 0);
        return Ok(new { videoPath = path });
    }

    [HttpGet("{courseId}/lessons/{lessonId}/video-token")]
    public async Task<IActionResult> GetVideoToken(Guid courseId, Guid lessonId)
    {
        try
        {
            await _courseService.GetCourseDetailAsync(courseId, CurrentUserId, CurrentRole, CurrentDepartment, CurrentCompanyId);
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Curso n\u00e3o encontrado." }); }

        var lesson = await _uow.Lessons.GetByIdAsync(lessonId);
        if (lesson == null || string.IsNullOrEmpty(lesson.VideoPath))
            return NotFound(new { message = "V\u00eddeo n\u00e3o encontrado." });

        var token = _jwtService.GenerateVideoToken(CurrentUserId, courseId, lessonId);
        return Ok(new { token });
    }

    [HttpGet("{courseId}/lessons/{lessonId}/video")]
    [AllowAnonymous]
    public async Task<IActionResult> StreamVideo(Guid courseId, Guid lessonId, [FromQuery] string? vt)
    {
        Guid resolvedUserId;

        if (!string.IsNullOrEmpty(vt))
        {
            // Short-lived video token path
            if (!_jwtService.ValidateVideoToken(vt, out resolvedUserId, out var vtCourseId, out var vtLessonId))
                return Unauthorized(new { message = "Token de v\u00eddeo inv\u00e1lido ou expirado." });
            if (vtCourseId != courseId || vtLessonId != lessonId)
                return Forbid();
        }
        else
        {
            // Bearer token path (fallback)
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized();
            resolvedUserId = Guid.Parse(userIdStr);

            try
            {
                await _courseService.GetCourseDetailAsync(courseId, resolvedUserId, CurrentRole, CurrentDepartment, CurrentCompanyId);
            }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Curso n\u00e3o encontrado." }); }
        }

        var lesson = await _uow.Lessons.GetByIdAsync(lessonId);
        if (lesson == null || string.IsNullOrEmpty(lesson.VideoPath))
            return NotFound(new { message = "Vídeo não encontrado." });

        if (!_storage.FileExists(lesson.VideoPath))
            return NotFound(new { message = "Arquivo de vídeo não encontrado no armazenamento. Reenvie o vídeo da aula." });

        var fileSize = _storage.GetFileSize(lesson.VideoPath);
        var rangeHeader = Request.Headers["Range"].ToString();

        if (string.IsNullOrEmpty(rangeHeader))
        {
            var stream = _storage.GetVideoStream(lesson.VideoPath);
            return File(stream, "video/mp4", enableRangeProcessing: true);
        }

        // Parse Range header: bytes=start-end
        var range = rangeHeader.Replace("bytes=", "").Split('-');
        var start = long.Parse(range[0]);
        var end = range.Length > 1 && !string.IsNullOrEmpty(range[1])
            ? long.Parse(range[1])
            : Math.Min(start + 1_000_000, fileSize - 1);

        var length = end - start + 1;
        var videoStream = _storage.GetVideoStream(lesson.VideoPath);
        videoStream.Seek(start, SeekOrigin.Begin);

        Response.StatusCode = 206;
        Response.Headers["Content-Range"] = $"bytes {start}-{end}/{fileSize}";
        Response.Headers["Accept-Ranges"] = "bytes";
        Response.Headers["Content-Length"] = length.ToString();
        Response.ContentType = "video/mp4";

        var buffer = new byte[length];
        await videoStream.ReadExactlyAsync(buffer, 0, (int)length);
        videoStream.Dispose();
        await Response.Body.WriteAsync(buffer);
        return new EmptyResult();
    }

    [HttpGet("{courseId}/lessons/{lessonId}/pdf")]
    public async Task<IActionResult> DownloadPdf(Guid courseId, Guid lessonId)
    {
        try
        {
            await _courseService.GetCourseDetailAsync(courseId, CurrentUserId, CurrentRole, CurrentDepartment, CurrentCompanyId);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Curso não encontrado." });
        }

        var lesson = await _uow.Lessons.GetByIdAsync(lessonId);
        if (lesson == null || lesson.ContentHtml == null)
            return NotFound(new { message = "Conteúdo de texto não encontrado." });

        var course = await _uow.Courses.GetByIdAsync(courseId);
        if (course == null) return NotFound();

        var pdfBytes = _pdfService.GenerateLessonPdf(lesson.Title, lesson.ContentHtml, course.Title);

        await _uow.AuditLogs.AddAsync(new Treinamentos.Domain.Entities.AuditLog
        {
            UserId = CurrentUserId,
            Action = Treinamentos.Domain.Enums.AuditAction.PdfDownloaded,
            DetailsJson = $"{{\"lessonId\":\"{lessonId}\",\"courseId\":\"{courseId}\"}}"
        });
        await _uow.SaveChangesAsync();

        var fileName = $"{course.Title} - {lesson.Title}.pdf"
            .Replace(" ", "_").Replace("/", "-");
        return File(pdfBytes, "application/pdf", fileName);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        try
        {
            await _courseService.DeleteCourseAsync(id, CurrentUserId, CurrentRole);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message == "WATCHED")
        {
            return Conflict(new { message = "O curso possui vídeos assistidos e não pode ser excluído. Deseja arquivá-lo?", canArchive = true });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> ArchiveCourse(Guid id)
    {
        try
        {
            await _courseService.ArchiveCourseAsync(id, CurrentUserId, CurrentRole);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
