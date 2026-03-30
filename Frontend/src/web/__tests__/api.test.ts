/// <reference types="jest" />
/**
 * Tests para Web API client (api.ts) - funciones fetch, create, update, delete
 */

// Reset fetch mock antes de cada test
beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

describe('Web API - fetchTasks', () => {
  test('llama a GET /api/proxy/tasks con parámetros de paginación', async () => {
    const mockResponse = {
      items: [{ id: '1', title: 'Test', description: '', priority: 'High', status: 'Pending', createdAt: '2026-03-30', startDate: null, dueDate: null, workedHours: 0 }],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 50,
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const { fetchTasks } = await import('../../web/api');
    const result = await fetchTasks(1, 50);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/proxy/tasks?pageNumber=1&pageSize=50',
      { credentials: 'same-origin' }
    );
    expect(result.items).toHaveLength(1);
    expect(result.totalCount).toBe(1);
  });

  test('lanza error cuando la respuesta no es ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });

    const { fetchTasks } = await import('../../web/api');
    await expect(fetchTasks()).rejects.toThrow('HTTP 401');
  });

  test('devuelve valores por defecto cuando la respuesta no tiene campos', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const { fetchTasks } = await import('../../web/api');
    const result = await fetchTasks();

    expect(result.items).toEqual([]);
    expect(result.totalCount).toBe(0);
  });
});

describe('Web API - createTask', () => {
  test('envía POST con payload correcto incluyendo fechas', async () => {
    const taskPayload = {
      title: 'Nueva tarea',
      description: 'Descripción',
      priority: 'High',
      state: 'Pending',
      startDate: '2026-04-01T09:00:00',
      dueDate: '2026-04-15T17:00:00',
      workedHours: 0,
    };
    const mockTask = { id: '1', ...taskPayload, status: 'Pending', createdAt: '2026-03-30' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockTask),
    });

    const { createTask } = await import('../../web/api');
    const result = await createTask(taskPayload);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/proxy/tasks',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(taskPayload),
      })
    );
    expect(result.id).toBe('1');
  });

  test('lanza error con mensaje del servidor al fallar', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'El título es obligatorio.' }),
    });

    const { createTask } = await import('../../web/api');
    await expect(createTask({
      title: '',
      description: '',
      priority: 'High',
      state: 'Pending',
      startDate: null,
      dueDate: null,
      workedHours: 0,
    })).rejects.toThrow('El título es obligatorio.');
  });
});

describe('Web API - updateTask', () => {
  test('envía PUT con id y payload actualizado', async () => {
    const payload = {
      title: 'Editada',
      description: 'Nueva desc',
      priority: 'Medium',
      state: 'InProgress',
      startDate: '2026-04-01T09:00:00',
      dueDate: '2026-04-20T17:00:00',
      workedHours: 8.5,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 'abc-123', ...payload, status: 'InProgress' }),
    });

    const { updateTask } = await import('../../web/api');
    const result = await updateTask('abc-123', payload);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/proxy/tasks/abc-123',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    );
    expect(result.workedHours).toBe(8.5);
  });

  test('lanza error en conflicto de concurrencia (409)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ error: 'Conflicto de concurrencia' }),
    });

    const { updateTask } = await import('../../web/api');
    await expect(updateTask('abc-123', {
      title: 'Test', description: '', priority: 'Low', state: 'Pending',
      startDate: null, dueDate: null, workedHours: 0,
    })).rejects.toThrow('Conflicto de concurrencia');
  });
});

describe('Web API - deleteTask', () => {
  test('envía DELETE con id correcto', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { deleteTask } = await import('../../web/api');
    await deleteTask('abc-123');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/proxy/tasks/abc-123',
      { method: 'DELETE', credentials: 'same-origin' }
    );
  });

  test('no lanza error para status 204', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 204,
    });

    const { deleteTask } = await import('../../web/api');
    await expect(deleteTask('abc-123')).resolves.toBeUndefined();
  });

  test('lanza error para status no-204 no-ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { deleteTask } = await import('../../web/api');
    await expect(deleteTask('abc-123')).rejects.toThrow('HTTP 500');
  });
});
