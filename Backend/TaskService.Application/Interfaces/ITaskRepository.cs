using TaskService.Domain.Entities;

namespace TaskService.Application.Interfaces;

public interface ITaskRepository
{
    // READ
    Task<(IEnumerable<TaskItem>, int)> GetPagedAsync(
        TaskState? state,
        TaskPriority? priority,
        int pageNumber,
        int pageSize);

    Task<TaskItem?> GetByIdAsync(Guid id);

    // CREATE
    Task<TaskItem> AddAsync(TaskItem task);

    // UPDATE
    Task UpdateAsync(TaskItem task);

    // DELETE
    Task<bool> DeleteAsync(Guid id);
}