using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Treinamentos.Application.Services;
using Treinamentos.Domain.Enums;

namespace Treinamentos.API.Controllers;

[ApiController]
[Route("api/v1/audit")]
[Authorize(Roles = "Administrador")]
public class AuditController : ControllerBase
{
    private readonly AuditService _auditService;

    public AuditController(AuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] Guid? userId,
        [FromQuery] AuditAction? action,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var logs = await _auditService.GetLogsAsync(userId, action, from, to, page, pageSize);
        return Ok(logs);
    }
}
