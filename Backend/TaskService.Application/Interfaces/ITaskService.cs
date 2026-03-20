using TaskService.Application.Common;
using TaskService.Application.DTOs;
using TaskService.Domain.Entities;

namespace TaskService.Application.Interfaces;

public interface ITaskService
{
    // READ
    Task<PagedResult<TaskDto>> GetTasksAsync(
        TaskState? state,
        TaskPriority? priority,
        int pageNumber,
        int pageSize);

    Task<TaskDto?> GetByIdAsync(Guid id);

    // CREATE
    Task<TaskDto> CreateAsync(TaskCreateDto dto);

    // UPDATE
    Task<TaskDto?> UpdateAsync(Guid id, TaskCreateDto dto);

    // DELETE
    Task<bool> DeleteAsync(Guid id);
}
