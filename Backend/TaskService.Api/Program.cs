using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
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

builder.Services.AddControllers();
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
        Title = "Task Service API",
        Version = "v1.0.0",
        Description = "API para gestión de tareas personales"
    });

    // Configurar seguridad API Key
    options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        Name = "X-API-Key",
        In = ParameterLocation.Header,
        Description = "API Key - Valor: 123456"
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
            // Tareas Pendientes - Prioridad Alta
            new TaskItem("Implementar autenticación OAuth", "Investigar y configurar OAuth2 para la aplicación", TaskPriority.High, TaskState.Pending),
            new TaskItem("Resolver bug crítico en login", "El usuario no puede acceder con redes sociales", TaskPriority.High, TaskState.Pending),
            new TaskItem("Documentar API REST", "Crear especificación OpenAPI completa", TaskPriority.High, TaskState.Pending),
            
            // Tareas Pendientes - Prioridad Media
            new TaskItem("Actualizar dependencias", "Actualizar NuGet packages a las versiones más recientes", TaskPriority.Medium, TaskState.Pending),
            new TaskItem("Revisar cobertura de tests", "Asegurar que la cobertura sea mayor a 80%", TaskPriority.Medium, TaskState.Pending),
            new TaskItem("Refactorizar módulo de reportes", "Mejorar claridad y performance del código", TaskPriority.Medium, TaskState.Pending),
            new TaskItem("Crear script de migración", "Base de datos principal a producción", TaskPriority.Medium, TaskState.Pending),
            new TaskItem("Optimizar queries de búsqueda", "Reducir tiempo de respuesta en 40%", TaskPriority.Medium, TaskState.Pending),
            
            // Tareas Pendientes - Prioridad Baja
            new TaskItem("Mejorar diseño de botones", "Actualizar estilos CSS según guía de marca", TaskPriority.Low, TaskState.Pending),
            new TaskItem("Limpiar código legacy", "Eliminar funciones deprecadas", TaskPriority.Low, TaskState.Pending),
            new TaskItem("Actualizar ReadMe", "Incluir instrucciones de setup nuevas", TaskPriority.Low, TaskState.Pending),
            
            // Tareas En Progreso - Prioridad Alta
            new TaskItem("Integración con Stripe", "Implementar pagos en línea", TaskPriority.High, TaskState.InProgress),
            new TaskItem("Setup de infraestructura en AWS", "Configurar EC2, RDS y S3", TaskPriority.High, TaskState.InProgress),
            new TaskItem("Implementar caché con Redis", "Mejorar performance del sistema", TaskPriority.High, TaskState.InProgress),
            
            // Tareas En Progreso - Prioridad Media
            new TaskItem("Diseñar dashboard de analytics", "Crear visualizaciones de datos de usuarios", TaskPriority.Medium, TaskState.InProgress),
            new TaskItem("Implementar notificaciones push", "Agregar capacidad de notificaciones en tiempo real", TaskPriority.Medium, TaskState.InProgress),
            new TaskItem("Configurar CI/CD con GitHub Actions", "Automatizar deploy y tests", TaskPriority.Medium, TaskState.InProgress),
            new TaskItem("Crear test suite completa", "Unit tests y integration tests", TaskPriority.Medium, TaskState.InProgress),
            
            // Tareas En Progreso - Prioridad Baja
            new TaskItem("Mejorar accesibilidad (a11y)", "Cumplir estándares WCAG 2.1", TaskPriority.Low, TaskState.InProgress),
            new TaskItem("Optimizar imágenes", "Reducir tamaño de assets", TaskPriority.Low, TaskState.InProgress),
            
            // Tareas Completadas - Prioridad Alta
            new TaskItem("Estudiar .NET", "Arquitectura limpia y patrones de diseño", TaskPriority.High, TaskState.Completed),
            new TaskItem("Implementar validación de datos", "DTOs y FluentValidation", TaskPriority.High, TaskState.Completed),
            new TaskItem("Crear base de datos inicial", "Schema y stored procedures", TaskPriority.High, TaskState.Completed),
            
            // Tareas Completadas - Prioridad Media
            new TaskItem("Ejercicio", "Ir al gimnasio y completar rutina de 45 minutos", TaskPriority.Medium, TaskState.Completed),
            new TaskItem("Implementar paginación", "Agregar soporte para paginación en GET", TaskPriority.Medium, TaskState.Completed),
            new TaskItem("Crear filtros de búsqueda", "Filtración por estado, prioridad y fecha", TaskPriority.Medium, TaskState.Completed),
            new TaskItem("Documentar código", "Agregar comentarios XML a todas las clases", TaskPriority.Medium, TaskState.Completed),
            new TaskItem("Revisar seguridad de API", "Implementar autenticación con API Key", TaskPriority.Medium, TaskState.Completed),
            
            // Tareas Completadas - Prioridad Baja
            new TaskItem("Leer libro", "DDD - Domain Driven Design", TaskPriority.Low, TaskState.Completed),
            new TaskItem("Crear cuenta en GitHub", "Para versionamiento del proyecto", TaskPriority.Low, TaskState.Completed),
            new TaskItem("Configurar editor de código", "Setup de VS Code con extensiones recomendadas", TaskPriority.Low, TaskState.Completed),
            new TaskItem("Revisar buenas prácticas", "SOLID, KISS, DRY", TaskPriority.Low, TaskState.Completed),
            new TaskItem("Investigar frameworks modernos", "Comparativa de Next.js vs Vite", TaskPriority.Low, TaskState.Completed)
        };

        db.Tasks.AddRange(tasks);
        db.SaveChanges();
    }
}