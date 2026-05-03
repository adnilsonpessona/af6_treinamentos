using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Treinamentos.Application.DTOs.Auth;
using Treinamentos.Application.Services;

namespace Treinamentos.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var ua = Request.Headers["User-Agent"].ToString();
            var result = await _authService.LoginAsync(request, ip, ua);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")!);
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        await _authService.LogoutAsync(userId, token, ip);
        return NoContent();
    }

    [HttpPost("activate")]
    public async Task<IActionResult> Activate([FromBody] ActivateAccountRequest request)
    {
        try
        {
            await _authService.ActivateAccountAsync(request);
            return Ok(new { message = "Conta ativada com sucesso." });
        }
        catch (Exception ex) when (ex is InvalidOperationException || ex is ArgumentException)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
