using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Treinamentos.Application.Services;

namespace Treinamentos.API.Controllers;

[ApiController]
[Route("api/v1/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reportService;

    public ReportsController(ReportService reportService)
    {
        _reportService = reportService;
    }

    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);
    private string CurrentRole => User.FindFirstValue(ClaimTypes.Role) ?? "";
    private string CurrentDepartment => User.FindFirstValue("department") ?? "";
    private Guid? CurrentCompanyId => Guid.TryParse(User.FindFirstValue("companyId"), out var id) ? id : null;

    [HttpGet("admin")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> GetAdminReport(
        [FromQuery] string? department,
        [FromQuery] string? courseId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetAdminReportAsync(department, courseId, from, to);
        return Ok(result);
    }

    [HttpGet("manager")]
    [Authorize(Roles = "Gestor")]
    public async Task<IActionResult> GetManagerReport()
    {
        try
        {
            var result = await _reportService.GetManagerReportAsync(CurrentUserId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("instructor")]
    [Authorize(Roles = "Instrutor")]
    public async Task<IActionResult> GetInstructorReport()
    {
        var result = await _reportService.GetInstructorReportAsync(CurrentUserId);
        return Ok(result);
    }

    [HttpGet("my-progress")]
    public async Task<IActionResult> GetMyProgress()
    {
        var result = await _reportService.GetMyProgressAsync(CurrentUserId, CurrentDepartment, CurrentCompanyId);
        return Ok(result);
    }
}
