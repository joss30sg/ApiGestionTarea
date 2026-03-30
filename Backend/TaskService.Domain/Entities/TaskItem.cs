using System.ComponentModel.DataAnnotations;

namespace TaskService.Domain.Entities;

/// <summary>
/// Enumeración que define los niveles de prioridad de una tarea.
/// </summary>
public enum TaskPriority
{
    /// <summary>Prioridad baja - Tareas que pueden esperar</summary>
    [Display(Name = "Baja", Description = "Tareas que pueden esperar")]
    Low,

    /// <summary>Prioridad media - Tareas normales</summary>
    [Display(Name = "Media", Description = "Tareas normales")]
    Medium,

    /// <summary>Prioridad alta - Tareas urgentes</summary>
    [Display(Name = "Alta", Description = "Tareas urgentes")]
    High
}

/// <summary>
/// Enumeración que define los estados posibles de una tarea.
/// </summary>
public enum TaskState
{
    /// <summary>La tarea aún no ha sido iniciada</summary>
    [Display(Name = "Pendiente", Description = "La tarea aún no ha sido iniciada")]
    Pending,

    /// <summary>La tarea está siendo realizada actualmente</summary>
    [Display(Name = "En Progreso", Description = "La tarea está siendo realizada actualmente")]
    InProgress,

    /// <summary>La tarea ha sido finalizada</summary>
    [Display(Name = "Completado", Description = "La tarea ha sido finalizada")]
    Completed
}

/// <summary>
/// Entidad que representa una tarea personal.
/// </summary>
public class TaskItem
{
    /// <summary>Identificador único de la tarea</summary>
    public Guid Id { get; private set; }

    /// <summary>Título o nombre de la tarea</summary>
    public string Title { get; private set; } = string.Empty;

    /// <summary>Descripción detallada de la tarea</summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>Nivel de prioridad de la tarea</summary>
    public TaskPriority Priority { get; private set; }

    /// <summary>Estado actual de la tarea</summary>
    public TaskState State { get; private set; }

    /// <summary>Fecha y hora de creación de la tarea</summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>Fecha de inicio de la tarea</summary>
    public DateTime? StartDate { get; private set; }

    /// <summary>Fecha de fin de la tarea</summary>
    public DateTime? DueDate { get; private set; }

    /// <summary>Horas trabajadas en la tarea</summary>
    public decimal WorkedHours { get; private set; }

    /// <summary>Token de concurrencia para Optimistic Locking</summary>
    public Guid ConcurrencyStamp { get; private set; } = Guid.NewGuid();

    private TaskItem() { }

    /// <summary>
    /// ✅ CRÍTICO: Validar caracteres especiales peligrosos (XSS prevention)
    /// Detecta intentos de inyección de código malicioso
    /// </summary>
    private static void ValidateInput(string input, string fieldName)
    {
        if (string.IsNullOrEmpty(input)) return;
        
        // Whitelist: solo permitir caracteres alfanuméricos, espacios y puntuación segura
        if (!System.Text.RegularExpressions.Regex.IsMatch(input, @"^[\p{L}\p{N}\s\-._,()!?:+/%@#=]+$"))
            throw new ArgumentException($"El campo {fieldName} contiene caracteres no permitidos.");
    }

    /// <summary>
    /// Crea una nueva instancia de una tarea.
    /// </summary>
    /// <param name="title">Título de la tarea (obligatorio)</param>
    /// <param name="description">Descripción detallada de la tarea</param>
    /// <param name="priority">Nivel de prioridad de la tarea</param>
    /// <param name="state">Estado inicial de la tarea (por defecto: Pending)</param>
    /// <exception cref="ArgumentException">Se lanza si el título está vacío o solo contiene espacios en blanco</exception>
    public TaskItem(string title, string description, TaskPriority priority, TaskState state = TaskState.Pending, DateTime? createdAt = null, DateTime? startDate = null, DateTime? dueDate = null, decimal workedHours = 0)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("El título es obligatorio.");

        if (workedHours < 0)
            throw new ArgumentException("Las horas trabajadas no pueden ser negativas.");

        if (startDate.HasValue && dueDate.HasValue && dueDate < startDate)
            throw new ArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio.");

        // ✅ CRÍTICO: Validar caracteres especiales antes de asignar
        ValidateInput(title, "Title");
        ValidateInput(description, "Description");

        Id = Guid.NewGuid();
        Title = title.Trim();
        Description = description ?? string.Empty;
        Priority = priority;
        State = state;
        CreatedAt = createdAt ?? DateTime.UtcNow;
        StartDate = startDate;
        DueDate = dueDate;
        WorkedHours = workedHours;
    }

    /// <summary>
    /// Actualiza los datos de la tarea.
    /// </summary>
    /// <param name="title">Nuevo título de la tarea (obligatorio)</param>
    /// <param name="description">Nueva descripción de la tarea</param>
    /// <param name="priority">Nuevo nivel de prioridad</param>
    /// <param name="state">Nuevo estado de la tarea</param>
    /// <exception cref="ArgumentException">Se lanza si el título está vacío o solo contiene espacios en blanco</exception>
    public void Update(string title, string description, TaskPriority priority, TaskState state, DateTime? startDate = null, DateTime? dueDate = null, decimal workedHours = 0)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("El título es obligatorio.");

        if (workedHours < 0)
            throw new ArgumentException("Las horas trabajadas no pueden ser negativas.");

        if (startDate.HasValue && dueDate.HasValue && dueDate < startDate)
            throw new ArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio.");

        // ✅ CRÍTICO: Validar caracteres especiales en actualización
        ValidateInput(title, "Title");
        ValidateInput(description, "Description");

        Title = title.Trim();
        Description = description ?? string.Empty;
        Priority = priority;
        State = state;
        StartDate = startDate;
        DueDate = dueDate;
        WorkedHours = workedHours;
        ConcurrencyStamp = Guid.NewGuid();
    }
}