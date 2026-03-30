namespace TaskService.Api.Middleware;

/// <summary>
/// Middleware que agrega un X-Request-ID único a cada request/response
/// para trazabilidad end-to-end entre frontend y backend.
/// </summary>
public class RequestIdMiddleware
{
    private readonly RequestDelegate _next;

    public RequestIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Usar el request ID del cliente si viene, o generar uno nuevo
        var requestId = context.Request.Headers["X-Request-ID"].FirstOrDefault()
                        ?? Guid.NewGuid().ToString("N")[..12];

        context.Items["RequestId"] = requestId;
        context.Response.Headers["X-Request-ID"] = requestId;

        using (Serilog.Context.LogContext.PushProperty("RequestId", requestId))
        {
            await _next(context);
        }
    }
}
