namespace TaskService.Api.Middleware;

public class ApiKeyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _apiKey;
    private readonly ILogger<ApiKeyMiddleware> _logger;

    public ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration, ILogger<ApiKeyMiddleware> logger)
    {
        _next = next;
        _logger = logger;
        _apiKey = Environment.GetEnvironmentVariable("API_KEY")
            ?? configuration["Security:ApiKey"]
            ?? throw new InvalidOperationException("API_KEY no configurada. Defina la variable de entorno API_KEY o Security:ApiKey en appsettings.");
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Permitir acceso a Swagger y rutas públicas sin API Key
        var path = context.Request.Path.Value ?? "";
        
        // Rutas públicas (no requieren API Key ni JWT)
        if (path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase) || 
            path.StartsWith("/swagger-ui", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/api/swagger", StringComparison.OrdinalIgnoreCase) ||
            path.Contains("swagger.json", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/api/auth", StringComparison.OrdinalIgnoreCase) ||
            path == "/" ||
            path == "" ||
            path == "/health")
        {
            await _next(context);
            return;
        }

        // Verificar si el usuario está autenticado con JWT
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            await _next(context);
            return;
        }

        // Fallback: Verificar API Key (compatibilidad legacy)
        var apiKeyHeader = context.Request.Headers.FirstOrDefault(h => 
            h.Key.Equals("X-API-Key", StringComparison.OrdinalIgnoreCase)).Value;

        if (string.IsNullOrEmpty(apiKeyHeader) || apiKeyHeader != _apiKey)
        {
            _logger.LogWarning("Acceso no autorizado: {Method} {Path} desde {IP}",
                context.Request.Method, path, context.Connection.RemoteIpAddress);

            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            
            var errorResponse = new
            {
                error = "No autorizado",
                message = "Se requiere JWT Bearer token o header 'X-API-Key' para acceder",
                code = "AUTH_REQUIRED",
                hint = "Use POST /api/auth/login para obtener un JWT, o incluya el header X-API-Key"
            };
            
            var json = System.Text.Json.JsonSerializer.Serialize(errorResponse);
            await context.Response.WriteAsync(json);
            return;
        }

        await _next(context);
    }
}