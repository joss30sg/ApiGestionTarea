using System.ComponentModel.DataAnnotations;
using TaskService.Domain.Entities;

namespace TaskService.Application.DTOs;

/// <summary>
/// DTO para crear una nueva tarea (entrada de datos).
/// ✅ VALIDACIÓN DE ENTRADA CRÍTICA
/// </summary>
public class TaskCreateDto
{
    /// <summary>
    /// Título de la tarea (obligatorio, 1-200 caracteres).
    /// </summary>
    [Required(ErrorMessage = "El título es obligatorio")]
    [StringLength(200, MinimumLength = 1, 
        ErrorMessage = "El título debe tener entre 1 y 200 caracteres")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Descripción de la tarea (opcional, máximo 2000 caracteres).
    /// </summary>
    [StringLength(2000, 
        ErrorMessage = "La descripción no puede exceder 2000 caracteres")]
    public string? Description { get; set; }

    /// <summary>
    /// Prioridad de la tarea (obligatorio: Low, Medium, High).
    /// </summary>
    [Required(ErrorMessage = "La prioridad es obligatoria")]
    [EnumDataType(typeof(TaskPriority), 
        ErrorMessage = "Prioridad inválida. Use: Low, Medium o High")]
    public TaskPriority Priority { get; set; }

    /// <summary>
    /// Estado inicial de la tarea (opcional, por defecto: Pending).
    /// </summary>
    [EnumDataType(typeof(TaskState), 
        ErrorMessage = "Estado inválido. Use: Pending, InProgress o Completed")]
    public TaskState? State { get; set; } = TaskState.Pending;
}

/// <summary>
/// Representa los datos de una tarea en las respuestas de la API.
/// </summary>
public class TaskDto
{
    /// <summary>
    /// Identificador único (GUID) de la tarea.
    /// </summary>
    [Display(Name = "ID de la Tarea")]
    public Guid Id { get; set; }

    /// <summary>
    /// Título o nombre corto de la tarea.
    /// </summary>
    [Display(Name = "Título")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Descripción detallada de la tarea.
    /// </summary>
    [Display(Name = "Descripción")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Prioridad de la tarea: Low (Baja), Medium (Media), High (Alta).
    /// </summary>
    [Display(Name = "Prioridad")]
    public string Priority { get; set; } = string.Empty;

    /// <summary>
    /// Estado actual de la tarea: Pending (Pendiente), InProgress (En progreso), Completed (Completado).
    /// </summary>
    [Display(Name = "Estado")]
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Fecha y hora de creación de la tarea en formato UTC.
    /// </summary>
    [Display(Name = "Fecha de Creación")]
    public DateTime CreatedAt { get; set; }

    public static TaskDto FromEntity(TaskItem task)
    {
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Priority = task.Priority.ToString(),
            Status = task.State.ToString(),
            CreatedAt = task.CreatedAt
        };
    }
}