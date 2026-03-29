using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
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
[Consumes("application/json")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _service;
    private readonly ILogger<TasksController> _logger;

    public TasksController(ITaskService service, ILogger<TasksController> logger)
    {
        _service = service;
        _logger = logger;
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

            _logger.LogInformation("Tareas obtenidas: {Count}/{Total} (página {Page}, filtros: state={State}, priority={Priority})",
                result.Items.Count(), result.TotalCount, pageNumber, state, priority);

            // Convertir a respuesta
            var response = ToPagedResponse(result);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validación fallida en GetAllTasks: {Error}", ex.Message);
            return BadRequest(new { error = ex.Message, code = "VALIDATION_ERROR" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado en GetAllTasks");
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
                _logger.LogWarning("Tarea no encontrada: {TaskId}", id);
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
            _logger.LogWarning("Validación fallida en GetTaskById({TaskId}): {Error}", id, ex.Message);
            return BadRequest(new { error = ex.Message, code = "VALIDATION_ERROR" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado en GetTaskById({TaskId})", id);
            return StatusCode(500, new { error = "Error interno del servidor", code = "INTERNAL_ERROR" });
        }
    }

    /// <summary>
    /// CREAR UNA NUEVA TAREA
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskDtoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateTask([FromBody] TaskCreateDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            var response = ToTaskResponse(created);
            _logger.LogInformation("Tarea creada: {TaskId} - {Title}", response.Id, dto.Title);
            return CreatedAtAction(nameof(GetTaskById), new { id = response.Id }, response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validación fallida en CreateTask: {Error}", ex.Message);
            return BadRequest(new { error = ex.Message, code = "VALIDATION_ERROR" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado en CreateTask");
            return StatusCode(500, new { error = "Error interno del servidor", code = "INTERNAL_ERROR" });
        }
    }

    /// <summary>
    /// ACTUALIZAR UNA TAREA EXISTENTE
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskDtoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateTask([FromRoute] Guid id, [FromBody] TaskCreateDto dto)
    {
        try
        {
            if (id == Guid.Empty)
                return BadRequest(new { error = "ID no válido.", code = "INVALID_ID_FORMAT" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, dto);
            if (updated is null)
            {
                _logger.LogWarning("Tarea no encontrada para actualizar: {TaskId}", id);
                return NotFound(new { error = "Tarea no encontrada.", code = "TASK_NOT_FOUND" });
            }

            _logger.LogInformation("Tarea actualizada: {TaskId}", id);
            return Ok(ToTaskResponse(updated));
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("concurrencia"))
        {
            _logger.LogWarning("Conflicto de concurrencia en UpdateTask({TaskId}): {Error}", id, ex.Message);
            return Conflict(new { error = ex.Message, code = "CONCURRENCY_CONFLICT" });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validación fallida en UpdateTask({TaskId}): {Error}", id, ex.Message);
            return BadRequest(new { error = ex.Message, code = "VALIDATION_ERROR" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado en UpdateTask({TaskId})", id);
            return StatusCode(500, new { error = "Error interno del servidor", code = "INTERNAL_ERROR" });
        }
    }

    /// <summary>
    /// ELIMINAR UNA TAREA
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteTask([FromRoute] Guid id)
    {
        try
        {
            if (id == Guid.Empty)
                return BadRequest(new { error = "ID no válido.", code = "INVALID_ID_FORMAT" });

            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
            {
                _logger.LogWarning("Tarea no encontrada para eliminar: {TaskId}", id);
                return NotFound(new { error = "Tarea no encontrada.", code = "TASK_NOT_FOUND" });
            }

            _logger.LogInformation("Tarea eliminada: {TaskId}", id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validación fallida en DeleteTask({TaskId}): {Error}", id, ex.Message);
            return BadRequest(new { error = ex.Message, code = "VALIDATION_ERROR" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado en DeleteTask({TaskId})", id);
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