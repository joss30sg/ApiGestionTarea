using Xunit;
using Moq;
using TaskService.Application.Services;
using TaskService.Application.Interfaces;
using TaskService.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public class TaskServiceTests
{
    [Fact]
    public void Should_Throw_When_Title_Is_Empty()
    {
        Assert.Throws<System.ArgumentException>(() =>
            new TaskItem("", "Desc", TaskPriority.High));
    }

    [Fact]
    public async Task Should_Return_Paged_Result()
    {
        var mockRepo = new Mock<ITaskRepository>();
        mockRepo.Setup(r => r.GetPagedAsync(null, null, 1, 10))
            .ReturnsAsync((new List<TaskItem>
            {
                new TaskItem("Titulo", "Desc", TaskPriority.High)
            }, 1));

        var service = new TaskService.Application.Services.TaskService(mockRepo.Object);

        var result = await service.GetTasksAsync(null, null, 1, 10);

        Assert.Equal(1, result.TotalCount);
        Assert.Single(result.Items);
    }

    /// <summary>
    /// ✅ NEW v1.1: Test para validación de GUID vacío
    /// Previene requests con parámetros inválidos
    /// </summary>
    [Fact]
    public async Task Should_Throw_When_Id_Is_Empty()
    {
        var mockRepo = new Mock<ITaskRepository>();
        var service = new TaskService.Application.Services.TaskService(mockRepo.Object);

        var exception = await Assert.ThrowsAsync<System.ArgumentException>(
            () => service.GetByIdAsync(System.Guid.Empty)
        );

        Assert.Equal("ID inválido.", exception.Message);
    }

    [Fact]
    public async Task Should_Return_Null_When_Task_Not_Found()
    {
        var mockRepo = new Mock<ITaskRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<System.Guid>()))
            .ReturnsAsync((TaskItem?)null);

        var service = new TaskService.Application.Services.TaskService(mockRepo.Object);
        var validId = System.Guid.NewGuid();

        var result = await service.GetByIdAsync(validId);

        Assert.Null(result);
    }

    [Fact]
    public async Task Should_Throw_When_PageNumber_Is_Zero()
    {
        var mockRepo = new Mock<ITaskRepository>();
        var service = new TaskService.Application.Services.TaskService(mockRepo.Object);

        await Assert.ThrowsAsync<System.ArgumentException>(
            () => service.GetTasksAsync(null, null, 0, 10)
        );
    }

    [Fact]
    public async Task Should_Throw_When_PageSize_Is_Zero()
    {
        var mockRepo = new Mock<ITaskRepository>();
        var service = new TaskService.Application.Services.TaskService(mockRepo.Object);

        await Assert.ThrowsAsync<System.ArgumentException>(
            () => service.GetTasksAsync(null, null, 1, 0)
        );
    }

    [Fact]
    public async Task Should_Limit_PageSize_To_Max()
    {
        var mockRepo = new Mock<ITaskRepository>();
        mockRepo.Setup(r => r.GetPagedAsync(null, null, 1, 50))
            .ReturnsAsync((new List<TaskItem>(), 0));

        var service = new TaskService.Application.Services.TaskService(mockRepo.Object);

        // Solicitar pageSize de 100 (mayor que el máximo de 50)
        var result = await service.GetTasksAsync(null, null, 1, 100);

        // Debe limitarse a 50
        Assert.Equal(50, result.PageSize);
    }

    [Fact]
    public void Should_Accept_Whitespace_Only_Title_As_Invalid()
    {
        // Las pruebas la lógica de IsNullOrWhiteSpace
        var title = "   ";

        var exception = Assert.Throws<System.ArgumentException>(() =>
            new TaskItem(title, "Desc", TaskPriority.High)
        );

        Assert.Equal("El título es obligatorio.", exception.Message);
    }

    [Fact]
    public async Task Should_Filter_Tasks_By_State()
    {
        var mockRepo = new Mock<ITaskRepository>();
        var pendingTask = new TaskItem("Pending Task", "Description", TaskPriority.High, TaskState.Pending);
        
        mockRepo.Setup(r => r.GetPagedAsync(TaskState.Pending, null, 1, 10))
            .ReturnsAsync((new List<TaskItem> { pendingTask }, 1));

        var service = new TaskService.Application.Services.TaskService(mockRepo.Object);

        var result = await service.GetTasksAsync(TaskState.Pending, null, 1, 10);

        Assert.Single(result.Items);
    }

    [Fact]
    public async Task Should_Filter_Tasks_By_Priority()
    {
        var mockRepo = new Mock<ITaskRepository>();
        var highPriorityTask = new TaskItem("High Priority", "Description", TaskPriority.High);
        
        mockRepo.Setup(r => r.GetPagedAsync(null, TaskPriority.High, 1, 10))
            .ReturnsAsync((new List<TaskItem> { highPriorityTask }, 1));

        var service = new TaskService.Application.Services.TaskService(mockRepo.Object);

        var result = await service.GetTasksAsync(null, TaskPriority.High, 1, 10);

        Assert.Single(result.Items);
    }

    [Fact]
    public void Should_Create_Task_With_Default_State()
    {
        var task = new TaskItem("Mi Tarea", "Descripción", TaskPriority.Medium);

        Assert.Equal(TaskState.Pending, task.State);
    }

    [Fact]
    public void Should_Create_Task_With_Specified_State()
    {
        var task = new TaskItem("Mi Tarea", "Descripción", TaskPriority.High, TaskState.InProgress);

        Assert.Equal(TaskState.InProgress, task.State);
    }

    [Fact]
    public void Should_Set_CreatedAt_To_UtcNow()
    {
        var beforeCreation = System.DateTime.UtcNow;
        var task = new TaskItem("Mi Tarea", "Descripción", TaskPriority.Low);
        var afterCreation = System.DateTime.UtcNow;

        Assert.True(task.CreatedAt >= beforeCreation);
        Assert.True(task.CreatedAt <= afterCreation);
    }

    [Fact]
    public void Should_Trim_Title_When_Creating_Task()
    {
        var task = new TaskItem("  Mi Tarea  ", "Descripción", TaskPriority.High);

        Assert.Equal("Mi Tarea", task.Title);
    }

    [Fact]
    public void Should_Set_Description_Empty_When_Null()
    {
        var task = new TaskItem("Mi Tarea", null!, TaskPriority.High);

        Assert.Equal(string.Empty, task.Description);
    }

    [Fact]
    public async Task Should_Return_Empty_List_When_No_Tasks()
    {
        var mockRepo = new Mock<ITaskRepository>();
        mockRepo.Setup(r => r.GetPagedAsync(null, null, 1, 10))
            .ReturnsAsync((new List<TaskItem>(), 0));

        var service = new TaskService.Application.Services.TaskService(mockRepo.Object);

        var result = await service.GetTasksAsync(null, null, 1, 10);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
    }
}
