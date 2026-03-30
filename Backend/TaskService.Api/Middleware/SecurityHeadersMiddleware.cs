namespace TaskService.Api.Middleware;

/// <summary>
/// Middleware que agrega headers de seguridad recomendados por OWASP.
/// Incluye CSP, X-Content-Type-Options, X-Frame-Options, etc.
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        // Prevenir MIME type sniffing
        headers["X-Content-Type-Options"] = "nosniff";

        // Prevenir clickjacking
        headers["X-Frame-Options"] = "DENY";

        // Habilitar XSS protection del navegador
        headers["X-XSS-Protection"] = "1; mode=block";

        // Referrer policy restringida
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Content Security Policy
        headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data:; " +
            "font-src 'self'; " +
            "connect-src 'self' http://localhost:* ws://localhost:*; " +
            "frame-ancestors 'none';";

        // Permissions Policy
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

        await _next(context);
    }
}
