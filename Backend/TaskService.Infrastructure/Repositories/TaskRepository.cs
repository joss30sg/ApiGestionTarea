using Microsoft.EntityFrameworkCore;
using TaskService.Application.Interfaces;
using TaskService.Domain.Entities;
using TaskService.Infrastructure.Persistence;

namespace TaskService.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<TaskItem>, int)> GetPagedAsync(
        TaskState? state,
        TaskPriority? priority,
        int pageNumber,
        int pageSize)
    {
        var query = _context.Tasks.AsQueryable();

        // Aplicar filtros
        if (state.HasValue)
            query = query.Where(t => t.State == state.Value);

        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        // Obtener el total antes de paginar
        var totalCount = await query.CountAsync();

        // Aplicar paginación con ordenamiento determinista
        var items = await query
            .OrderBy(t => t.CreatedAt)
            .ThenBy(t => t.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<TaskItem?> GetByIdAsync(Guid id)
    {
        return await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<TaskItem> AddAsync(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task UpdateAsync(TaskItem task)
    {
        _context.Tasks.Update(task);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new InvalidOperationException(
                "Conflicto de concurrencia: la tarea fue modificada por otro usuario. Recargue los datos e intente nuevamente.");
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
        if (task is null) return false;
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }
}