using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using TaskService.Api.Middleware;
using TaskService.Application.Interfaces;
using TaskService.Application.Services;
using TaskService.Infrastructure.Persistence;
using TaskService.Infrastructure.Repositories;
using TaskService.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

// Configurar Kestrel para escuchar en todas las interfaces (0.0.0.0)
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000);
    // Limitar tamaño máximo de request body (prevenir DoS attacks)
    options.Limits.MaxRequestBodySize = 524288; // 512 KB
});

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseInMemoryDatabase("TasksDb"));

builder.Services.AddScoped<ITaskRepository>(provider =>
    new TaskService.Infrastructure.Repositories.TaskRepository(
        provider.GetRequiredService<AppDbContext>()));

builder.Services.AddScoped<ITaskService, TaskService.Application.Services.TaskService>();

// ✅ CRÍTICO: CORS explícitamente configurado (previene ataques cross-origin)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()        // En desarrollo: permitir cualquier origen
              .AllowAnyMethod()         // GET, POST, PUT, DELETE, OPTIONS
              .AllowAnyHeader()         // Cualquier header
              .WithExposedHeaders("X-Total-Count"); // Headers que el cliente puede leer
    });
});

// Rate Limiting temporarily disabled for execution
// builder.Services.AddRateLimiter(options =>
// {
//     options.RejectionStatusCode = 429; // Too Many Requests
//     
//     options.AddFixedWindowLimiter(policyName: "tasks-api", opt =>
//     {
//         opt.PermitLimit = 100;           // Máximo 100 requests
//         opt.Window = TimeSpan.FromSeconds(1); // Por segundo
//         opt.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
//         opt.QueueLimit = 2;              // Máximo 2 en cola
//     });
// });

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        options.IncludeXmlComments(xmlPath);

    // Información de la API
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "📋 Task Service API",
        Version = "v1.0.0",
        Description = "API REST para gestión de tareas personales. Permite listar, filtrar y ver detalles de tareas."
    });

    // Configurar seguridad API Key
    options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        Name = "X-API-Key",
        In = ParameterLocation.Header,
        Description = "⚠️ REQUERIDO: API Key para autenticación. Valor: **123456**"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "ApiKey"
                }
            },
            new string[] { }
        }
    });

    // Agregar ejemplos en las respuestas
    options.SchemaFilter<SchemaExamplesFilter>();
    options.OperationFilter<OperationExamplesFilter>();
});

var app = builder.Build();

// Rate Limiting temporarily disabled
// app.UseRateLimiter();

// ✅ CRÍTICO: Aplicar CORS antes de cualquier otro middleware
app.UseCors("AllowAll");

// Seed de datos
SeedDatabase(app);

app.UseSwagger(options =>
{
    options.PreSerializeFilters.Add((swaggerDoc, httpRequest) =>
    {
        // Agregar custom servers de desarrollo
        swaggerDoc.Servers = new List<OpenApiServer>
        {
            new OpenApiServer { Url = "http://localhost:5000", Description = "Desarrollo - PC Local" },
            new OpenApiServer { Url = "http://192.168.18.8:5000", Description = "Desarrollo - Red Local" }
        };
    });
});

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Service API v1.0.0");
    options.RoutePrefix = string.Empty; // Mostrar Swagger en raíz
    options.DefaultModelsExpandDepth(2);
    options.DefaultModelExpandDepth(2);
    options.DisplayRequestDuration();
    options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
    
    // Configuración de seguridad
    options.OAuthClientId("swagger-ui");
    options.OAuthAppName("Task Service API - Swagger UI");
});

// Middleware de API Key DESPUÉS de Swagger para no bloquearlo
app.UseMiddleware<ApiKeyMiddleware>();

app.MapControllers();
app.Run();

void SeedDatabase(WebApplication app)
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (db.Tasks.Any()) return;

        var tasks = new[]
        {
            // Tareas Completadas (feb 23 - mar 2): primeras tareas finalizadas
            new TaskItem("Estudiar .NET", "Arquitectura limpia y patrones de diseño", TaskPriority.High, TaskState.Completed, new DateTime(2026, 2, 23, 8, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Leer libro", "DDD - Domain Driven Design", TaskPriority.Low, TaskState.Completed, new DateTime(2026, 2, 23, 14, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Crear cuenta en GitHub", "Para versionamiento del proyecto", TaskPriority.Low, TaskState.Completed, new DateTime(2026, 2, 24, 9, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Configurar editor de código", "Setup de VS Code con extensiones recomendadas", TaskPriority.Low, TaskState.Completed, new DateTime(2026, 2, 24, 15, 30, 0, DateTimeKind.Utc)),
            new TaskItem("Revisar buenas prácticas", "SOLID, KISS, DRY", TaskPriority.Low, TaskState.Completed, new DateTime(2026, 2, 25, 10, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Implementar validación de datos", "DTOs y FluentValidation", TaskPriority.High, TaskState.Completed, new DateTime(2026, 2, 26, 9, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Crear base de datos inicial", "Schema y stored procedures", TaskPriority.High, TaskState.Completed, new DateTime(2026, 2, 27, 11, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Ejercicio", "Ir al gimnasio y completar rutina de 45 minutos", TaskPriority.Medium, TaskState.Completed, new DateTime(2026, 2, 28, 7, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Implementar paginación", "Agregar soporte para paginación en GET", TaskPriority.Medium, TaskState.Completed, new DateTime(2026, 3, 1, 10, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Crear filtros de búsqueda", "Filtración por estado, prioridad y fecha", TaskPriority.Medium, TaskState.Completed, new DateTime(2026, 3, 1, 16, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Documentar código", "Agregar comentarios XML a todas las clases", TaskPriority.Medium, TaskState.Completed, new DateTime(2026, 3, 2, 9, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Revisar seguridad de API", "Implementar autenticación con API Key", TaskPriority.Medium, TaskState.Completed, new DateTime(2026, 3, 2, 14, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Investigar frameworks modernos", "Comparativa de Next.js vs Vite", TaskPriority.Low, TaskState.Completed, new DateTime(2026, 3, 3, 11, 0, 0, DateTimeKind.Utc)),

            // Tareas En Progreso (mar 5 - mar 14): trabajo activo
            new TaskItem("Integración con Stripe", "Implementar pagos en línea", TaskPriority.High, TaskState.InProgress, new DateTime(2026, 3, 5, 9, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Setup de infraestructura en AWS", "Configurar EC2, RDS y S3", TaskPriority.High, TaskState.InProgress, new DateTime(2026, 3, 6, 8, 30, 0, DateTimeKind.Utc)),
            new TaskItem("Implementar caché con Redis", "Mejorar performance del sistema", TaskPriority.High, TaskState.InProgress, new DateTime(2026, 3, 7, 10, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Diseñar dashboard de analytics", "Crear visualizaciones de datos de usuarios", TaskPriority.Medium, TaskState.InProgress, new DateTime(2026, 3, 8, 9, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Implementar notificaciones push", "Agregar capacidad de notificaciones en tiempo real", TaskPriority.Medium, TaskState.InProgress, new DateTime(2026, 3, 10, 11, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Configurar CI/CD con GitHub Actions", "Automatizar deploy y tests", TaskPriority.Medium, TaskState.InProgress, new DateTime(2026, 3, 11, 9, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Crear test suite completa", "Unit tests y integration tests", TaskPriority.Medium, TaskState.InProgress, new DateTime(2026, 3, 12, 10, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Mejorar accesibilidad (a11y)", "Cumplir estándares WCAG 2.1", TaskPriority.Low, TaskState.InProgress, new DateTime(2026, 3, 13, 14, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Optimizar imágenes", "Reducir tamaño de assets", TaskPriority.Low, TaskState.InProgress, new DateTime(2026, 3, 14, 9, 0, 0, DateTimeKind.Utc)),

            // Tareas Pendientes (mar 15 - mar 20): por hacer
            new TaskItem("Implementar autenticación OAuth", "Investigar y configurar OAuth2 para la aplicación", TaskPriority.High, TaskState.Pending, new DateTime(2026, 3, 15, 9, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Resolver bug crítico en login", "El usuario no puede acceder con redes sociales", TaskPriority.High, TaskState.Pending, new DateTime(2026, 3, 15, 14, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Documentar API REST", "Crear especificación OpenAPI completa", TaskPriority.High, TaskState.Pending, new DateTime(2026, 3, 16, 8, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Actualizar dependencias", "Actualizar NuGet packages a las versiones más recientes", TaskPriority.Medium, TaskState.Pending, new DateTime(2026, 3, 16, 15, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Revisar cobertura de tests", "Asegurar que la cobertura sea mayor a 80%", TaskPriority.Medium, TaskState.Pending, new DateTime(2026, 3, 17, 9, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Refactorizar módulo de reportes", "Mejorar claridad y performance del código", TaskPriority.Medium, TaskState.Pending, new DateTime(2026, 3, 17, 16, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Crear script de migración", "Base de datos principal a producción", TaskPriority.Medium, TaskState.Pending, new DateTime(2026, 3, 18, 10, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Optimizar queries de búsqueda", "Reducir tiempo de respuesta en 40%", TaskPriority.Medium, TaskState.Pending, new DateTime(2026, 3, 18, 15, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Mejorar diseño de botones", "Actualizar estilos CSS según guía de marca", TaskPriority.Low, TaskState.Pending, new DateTime(2026, 3, 19, 9, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Limpiar código legacy", "Eliminar funciones deprecadas", TaskPriority.Low, TaskState.Pending, new DateTime(2026, 3, 19, 14, 0, 0, DateTimeKind.Utc)),
            new TaskItem("Actualizar ReadMe", "Incluir instrucciones de setup nuevas", TaskPriority.Low, TaskState.Pending, new DateTime(2026, 3, 20, 8, 0, 0, DateTimeKind.Utc))
        };

        db.Tasks.AddRange(tasks);
        db.SaveChanges();
    }
}

// ====== FILTROS PERSONALIZADOS PARA SWAGGER ======

/// <summary>
/// Filtro para agregar ejemplos de respuesta en Swagger
/// </summary>
public class SchemaExamplesFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type.Name == "PagedResultDto")
        {
            schema.Example = new Microsoft.OpenApi.Any.OpenApiObject
            {
                ["totalCount"] = new Microsoft.OpenApi.Any.OpenApiInteger(33),
                ["pageNumber"] = new Microsoft.OpenApi.Any.OpenApiInteger(1),
                ["pageSize"] = new Microsoft.OpenApi.Any.OpenApiInteger(10),
                ["items"] = new Microsoft.OpenApi.Any.OpenApiArray
                {
                    new Microsoft.OpenApi.Any.OpenApiObject
                    {
                        ["id"] = new Microsoft.OpenApi.Any.OpenApiString("550e8400-e29b-41d4-a716-446655440000"),
                        ["title"] = new Microsoft.OpenApi.Any.OpenApiString("Implementar autenticación OAuth"),
                        ["description"] = new Microsoft.OpenApi.Any.OpenApiString("Investigar y configurar OAuth2 para la aplicación"),
                        ["priority"] = new Microsoft.OpenApi.Any.OpenApiString("High"),
                        ["status"] = new Microsoft.OpenApi.Any.OpenApiString("Pending"),
                        ["createdAt"] = new Microsoft.OpenApi.Any.OpenApiString("2026-02-15T10:30:00Z")
                    },
                    new Microsoft.OpenApi.Any.OpenApiObject
                    {
                        ["id"] = new Microsoft.OpenApi.Any.OpenApiString("550e8400-e29b-41d4-a716-446655440001"),
                        ["title"] = new Microsoft.OpenApi.Any.OpenApiString("Integración con Stripe"),
                        ["description"] = new Microsoft.OpenApi.Any.OpenApiString("Implementar pagos en línea"),
                        ["priority"] = new Microsoft.OpenApi.Any.OpenApiString("High"),
                        ["status"] = new Microsoft.OpenApi.Any.OpenApiString("InProgress"),
                        ["createdAt"] = new Microsoft.OpenApi.Any.OpenApiString("2026-02-10T08:15:00Z")
                    }
                }
            };
        }
        else if (context.Type.Name == "TaskDtoResponse")
        {
            schema.Example = new Microsoft.OpenApi.Any.OpenApiObject
            {
                ["id"] = new Microsoft.OpenApi.Any.OpenApiString("550e8400-e29b-41d4-a716-446655440000"),
                ["title"] = new Microsoft.OpenApi.Any.OpenApiString("Implementar autenticación OAuth"),
                ["description"] = new Microsoft.OpenApi.Any.OpenApiString("Investigar y configurar OAuth2 para la aplicación"),
                ["priority"] = new Microsoft.OpenApi.Any.OpenApiString("High"),
                ["status"] = new Microsoft.OpenApi.Any.OpenApiString("Pending"),
                ["createdAt"] = new Microsoft.OpenApi.Any.OpenApiString("2026-02-15T10:30:00Z")
            };
        }
    }
}

/// <summary>
/// Filtro para mejorar descripción de operaciones en Swagger
/// </summary>
public class OperationExamplesFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (operation.OperationId == "GetAllTasks")
        {
            operation.Description = @"📌 Obtiene un listado paginado de tareas con opciones de filtrado.

### Casos de Uso:
- **GET /api/tasks** → Obtiene todas las tareas (página 1, 10 items)
- **GET /api/tasks?state=Pending** → Solo tareas pendientes
- **GET /api/tasks?priority=High** → Solo tareas de alta prioridad
- **GET /api/tasks?state=Pending&priority=High** → Tareas pendientes de alta prioridad
- **GET /api/tasks?pageNumber=2&pageSize=5** → Segunda página con 5 tareas

### Filtros Disponibles:
- `state`: Pending, InProgress, Completed
- `priority`: Low, Medium, High
- `pageNumber`: Número de página (mín: 1)
- `pageSize`: Tareas por página (mín: 1, máx: 50)

### Ejemplo de Respuesta (200 OK):
```json
{
  ""totalCount"": 33,
  ""pageNumber"": 1,
  ""pageSize"": 10,
  ""items"": [
    {
      ""id"": ""550e8400-e29b-41d4-a716-446655440000"",
      ""title"": ""Implementar autenticación OAuth"",
      ""description"": ""Investigar y configurar OAuth2"",
      ""priority"": ""High"",
      ""status"": ""Pending"",
      ""createdAt"": ""2026-02-15T10:30:00Z""
    }
  ]
}
```";
            operation.Summary = "📋 Listar tareas (con filtros)";
        }
        else if (operation.OperationId == "GetTaskById")
        {
            operation.Description = @"📌 Obtiene los detalles completos de una tarea específica.

### Casos de Uso:
- **GET /api/tasks/550e8400-e29b-41d4-a716-446655440000** → Obtiene una tarea específica

### Errores Posibles:
- `400 Bad Request`: ID no es un GUID válido
- `404 Not Found`: La tarea no existe o fue eliminada
- `401 Unauthorized`: Falta el header X-API-Key

### Ejemplo de Respuesta (200 OK):
```json
{
  ""id"": ""550e8400-e29b-41d4-a716-446655440000"",
  ""title"": ""Implementar autenticación OAuth"",
  ""description"": ""Investigar y configurar OAuth2 para la aplicación"",
  ""priority"": ""High"",
  ""status"": ""Pending"",
  ""createdAt"": ""2026-02-15T10:30:00Z""
}
```";
            operation.Summary = "🔍 Obtener detalle de tarea";
        }
    }
}
