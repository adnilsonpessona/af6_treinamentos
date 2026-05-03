using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Treinamentos.Application.DTOs.Progress;
using Treinamentos.Application.Services;

namespace Treinamentos.API.Controllers;

[ApiController]
[Route("api/v1/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly ProgressService _progressService;

    public ProgressController(ProgressService progressService)
    {
        _progressService = progressService;
    }

    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);

    [HttpPost("video")]
    public async Task<IActionResult> UpdateVideoProgress([FromBody] UpdateVideoProgressRequest request)
    {
        try
        {
            var result = await _progressService.UpdateVideoProgressAsync(CurrentUserId, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("lesson-access")]
    public async Task<IActionResult> RecordLessonAccess([FromBody] Guid lessonId)
    {
        await _progressService.RecordLessonTextAccessAsync(CurrentUserId, lessonId);
        return Ok();
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetCourseProgress(Guid courseId)
    {
        try
        {
            var result = await _progressService.GetCourseProgressAsync(CurrentUserId, courseId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
