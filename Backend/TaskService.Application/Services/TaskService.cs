using System.Linq;
using TaskService.Application.Common;
using TaskService.Application.DTOs;
using TaskService.Application.Interfaces;
using TaskService.Domain.Entities;

namespace TaskService.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;
    private const int MaxPageSize = 50;

    public TaskService(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<TaskDto>> GetTasksAsync(
        TaskState? state,
        TaskPriority? priority,
        int pageNumber,
        int pageSize)
    {
        if (pageNumber <= 0)
            throw new ArgumentException("pageNumber debe ser mayor que 0.");

        if (pageSize <= 0)
            throw new ArgumentException("pageSize debe ser mayor que 0.");

        if (pageSize > MaxPageSize)
            pageSize = MaxPageSize;

        (IEnumerable<TaskItem> items, int totalCount) =
            await _repository.GetPagedAsync(state, priority, pageNumber, pageSize);

        return new PagedResult<TaskDto>
        {
            Items = items.Select(TaskDto.FromEntity),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<TaskDto?> GetByIdAsync(Guid id)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("ID inválido.");

        var entity = await _repository.GetByIdAsync(id);
        return entity is null ? null : TaskDto.FromEntity(entity);
    }
}