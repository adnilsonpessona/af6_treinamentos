using Treinamentos.Application.Services;

namespace Treinamentos.API.Middleware;

public class TokenRevocationMiddleware
{
    private readonly RequestDelegate _next;

    public TokenRevocationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AuthService authService)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var token = context.Request.Headers["Authorization"]
                .ToString().Replace("Bearer ", "");

            if (!string.IsNullOrEmpty(token) && await authService.IsTokenRevokedAsync(token))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new { message = "Token revogado." });
                return;
            }
        }

        await _next(context);
    }
}
