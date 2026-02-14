namespace TaskService.Api.Middleware;

public class ApiKeyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _apiKey;

    public ApiKeyMiddleware(RequestDelegate next)
    {
        _next = next;
        // Leer de variable de entorno primero, luego usar valor por defecto para desarrollo
        _apiKey = Environment.GetEnvironmentVariable("API_KEY") ?? "123456";
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Permitir acceso a Swagger y rutas públicas sin API Key
        var path = context.Request.Path.Value ?? "";
        if (path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase) || 
            path.StartsWith("/swagger-ui", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/api/swagger", StringComparison.OrdinalIgnoreCase) ||
            path == "/" ||
            path == "")
        {
            await _next(context);
            return;
        }

        // Buscar API Key con case-insensitive
        var apiKeyHeader = context.Request.Headers.FirstOrDefault(h => 
            h.Key.Equals("X-API-Key", StringComparison.OrdinalIgnoreCase)).Value;

        if (string.IsNullOrEmpty(apiKeyHeader) || apiKeyHeader != _apiKey)
        {
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            
            var errorResponse = new
            {
                error = "No autorizado",
                message = "Se requiere el header 'X-API-Key' para acceder a este recurso",
                code = "API_KEY_REQUIRED",
                hint = "Incluya el header X-API-Key con el valor: 123456",
                example = "curl -H 'X-API-Key: 123456' http://localhost:5000/api/tasks"
            };
            
            var json = System.Text.Json.JsonSerializer.Serialize(errorResponse);
            await context.Response.WriteAsync(json);
            return;
        }

        await _next(context);
    }
}