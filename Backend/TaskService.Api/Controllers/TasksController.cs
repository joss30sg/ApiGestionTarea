using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using TaskService.Application.Interfaces;
using TaskService.Application.DTOs;
using TaskService.Application.Common;
using TaskService.Domain.Entities;

namespace TaskService.Api.Controllers;

/// <summary>
/// API de Gestión de Tareas - Lee y filtra tareas personales
/// </summary>
/// <remarks>
/// Todos los endpoints requieren el header: **X-API-Key: 123456**
/// </remarks>
[ApiController]
[Route("api/tasks")]
[Produces("application/json")]
// [RequireRateLimiting("tasks-api")] // Temporarily disabled for execution
public class TasksController : ControllerBase
{
    private readonly ITaskService _service;

    public TasksController(ITaskService service)
    {
        _service = service;
    }

    /// <summary>
    /// OBTENER LISTA DE TAREAS - Con filtros y paginación
    /// </summary>
    /// <remarks>
    /// **¿Qué hace?** Devuelve un listado de tareas con opciones para filtrar y paginar.
    /// 
    /// **Parámetros (todos opcionales):**
    /// - `state`: Pending, InProgress, Completed
    /// - `priority`: Low, Medium, High
    /// - `pageNumber`: Número de página (min: 1, default: 1)
    /// - `pageSize`: Tareas por página (min: 1, max: 50, default: 10)
    /// 
    /// **Ejemplo:**
    /// `GET /api/tasks?state=Pending&priority=High&pageNumber=1&pageSize=10`
    /// </remarks>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> GetAllTasks(
        [FromQuery(Name = "state")] string? state = null,
        [FromQuery(Name = "priority")] string? priority = null,
        [FromQuery(Name = "pageNumber")] int pageNumber = 1,
        [FromQuery(Name = "pageSize")] int pageSize = 10)
    {
        try
        {
            // Validar y convertir parámetros
            var validationError = ValidateAndParseFilters(state, priority, pageNumber, pageSize, out var validState, out var validPriority, out var validPageSize);
            if (validationError != null)
                return validationError;

            // Obtener tareas de la base de datos
            var result = await _service.GetTasksAsync(validState, validPriority, pageNumber, validPageSize);

            // Convertir a respuesta
            var response = ToPagedResponse(result);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message, code = "VALIDATION_ERROR" });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Error interno del servidor", code = "INTERNAL_ERROR" });
        }
    }

    /// <summary>
    /// OBTENER DETALLE DE UNA TAREA - Por ID
    /// </summary>
    /// <remarks>
    /// **¿Qué hace?** Devuelve los detalles completos de una tarea específica.
    /// 
    /// **Parámetro:**
    /// - `id`: ID único de la tarea (GUID válido)
    /// 
    /// **Ejemplo:**
    /// `GET /api/tasks/550e8400-e29b-41d4-a716-446655440000`
    /// </remarks>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskDtoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTaskById([FromRoute] Guid id)
    {
        try
        {
            // Validar que el ID no esté vacío
            if (id == Guid.Empty)
            {
                return BadRequest(new 
                { 
                    error = "ID no válido. Se requiere un GUID válido.",
                    code = "INVALID_ID_FORMAT"
                });
            }

            // Buscar la tarea
            var task = await _service.GetByIdAsync(id);
            if (task is null) 
            {
                return NotFound(new 
                { 
                    error = "Tarea no encontrada. Es posible que haya sido eliminada.",
                    code = "TASK_NOT_FOUND"
                });
            }

            // Convertir a respuesta
            var response = ToTaskResponse(task);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message, code = "VALIDATION_ERROR" });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Error interno del servidor", code = "INTERNAL_ERROR" });
        }
    }

    // ====== MÉTODOS PRIVADOS (Helpers) ======

    /// <summary>
    /// Valida y convierte los parámetros de filtro
    /// </summary>
    private IActionResult? ValidateAndParseFilters(
        string? state, string? priority, int pageNumber, int pageSize,
        out TaskState? validState, out TaskPriority? validPriority, out int validPageSize)
    {
        validState = null;
        validPriority = null;
        validPageSize = pageSize;

        // Validar estado
        if (!string.IsNullOrEmpty(state))
        {
            if (!Enum.TryParse<TaskState>(state, ignoreCase: true, out var parsedState))
            {
                return BadRequest(new 
                { 
                    error = $"Estado inválido: '{state}'. Use: Pending, InProgress, Completed",
                    code = "INVALID_STATE"
                });
            }
            validState = parsedState;
        }

        // Validar prioridad
        if (!string.IsNullOrEmpty(priority))
        {
            if (!Enum.TryParse<TaskPriority>(priority, ignoreCase: true, out var parsedPriority))
            {
                return BadRequest(new 
                { 
                    error = $"Prioridad inválida: '{priority}'. Use: Low, Medium, High",
                    code = "INVALID_PRIORITY"
                });
            }
            validPriority = parsedPriority;
        }

        // Validar paginación
        if (pageNumber <= 0)
        {
            return BadRequest(new { error = "pageNumber debe ser mayor que 0", code = "INVALID_PAGE_NUMBER" });
        }

        if (pageSize <= 0)
        {
            return BadRequest(new { error = "pageSize debe ser mayor que 0", code = "INVALID_PAGE_SIZE" });
        }

        // Limitar tamaño de página
        validPageSize = pageSize > 50 ? 50 : pageSize;
        return null;
    }

    /// <summary>
    /// Convierte una tarea a DTO de respuesta
    /// </summary>
    private TaskDtoResponse ToTaskResponse(TaskDto task)
    {
        return new TaskDtoResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Priority = task.Priority,
            Status = task.Status,
            CreatedAt = task.CreatedAt
        };
    }

    /// <summary>
    /// Convierte un PagedResult a DTO de respuesta paginada
    /// </summary>
    private PagedResultDto ToPagedResponse(PagedResult<TaskDto> result)
    {
        return new PagedResultDto
        {
            Items = result.Items?.Select(ToTaskResponse) ?? Enumerable.Empty<TaskDtoResponse>(),
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize
        };
    }

}

/// <summary>
/// DTO de respuesta para una tarea individual.
/// </summary>
public class TaskDtoResponse
{
    /// <summary>Identificador único (GUID) de la tarea</summary>
    public Guid Id { get; set; }
    /// <summary>Título o nombre corto de la tarea</summary>
    public string Title { get; set; } = string.Empty;
    /// <summary>Descripción detallada de lo que debe hacerse</summary>
    public string Description { get; set; } = string.Empty;
    /// <summary>Nivel de prioridad (Low, Medium, High)</summary>
    public string Priority { get; set; } = string.Empty;
    /// <summary>Estado actual (Pending, InProgress, Completed)</summary>
    public string Status { get; set; } = string.Empty;
    /// <summary>Fecha y hora de creación en formato ISO 8601 (UTC)</summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO de respuesta paginada para listado de tareas.
/// </summary>
public class PagedResultDto
{
    /// <summary>Arreglo de tareas recuperadas en esta página</summary>
    public IEnumerable<TaskDtoResponse> Items { get; set; } = Enumerable.Empty<TaskDtoResponse>();
    /// <summary>Número total de tareas en el sistema (considerando filtros)</summary>
    public int TotalCount { get; set; }
    /// <summary>Número de página actual (comienza en 1)</summary>
    public int PageNumber { get; set; }
    /// <summary>Cantidad de registros por página</summary>
    public int PageSize { get; set; }
}