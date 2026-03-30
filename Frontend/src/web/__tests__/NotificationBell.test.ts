/// <reference types="jest" />
/**
 * Tests para NotificationBell - Lógica de generación de notificaciones
 * y gestión de estado de lectura.
 */

// Extraemos la lógica pura para testing sin dependencias de React
interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  startDate: string | null;
  dueDate: string | null;
  workedHours: number;
}

interface TaskNotification {
  id: string;
  taskId: string;
  title: string;
  message: string;
  type: 'overdue' | 'due-today' | 'due-soon';
  read: boolean;
  timestamp: Date;
}

function generateNotifications(tasks: Task[], now: Date = new Date()): TaskNotification[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);

  const notifications: TaskNotification[] = [];

  for (const task of tasks) {
    if (!task.dueDate || task.status === 'Completed') continue;

    const due = new Date(task.dueDate);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    if (dueDay < today) {
      notifications.push({
        id: `overdue-${task.id}`,
        taskId: task.id,
        title: task.title,
        message: `Venció el ${due.toLocaleDateString()}`,
        type: 'overdue',
        read: false,
        timestamp: due,
      });
    } else if (dueDay.getTime() === today.getTime()) {
      notifications.push({
        id: `due-today-${task.id}`,
        taskId: task.id,
        title: task.title,
        message: `Vence hoy a las ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: 'due-today',
        read: false,
        timestamp: due,
      });
    } else if (dueDay < in3Days) {
      notifications.push({
        id: `due-soon-${task.id}`,
        taskId: task.id,
        title: task.title,
        message: `Vence el ${due.toLocaleDateString()}`,
        type: 'due-soon',
        read: false,
        timestamp: due,
      });
    }
  }

  notifications.sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, 'due-today': 1, 'due-soon': 2 };
    return (order[a.type] ?? 3) - (order[b.type] ?? 3);
  });

  return notifications;
}

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    title: 'Tarea de prueba',
    description: 'Descripción',
    priority: 'Medium',
    status: 'Pending',
    createdAt: '2026-03-01T00:00:00',
    startDate: null,
    dueDate: null,
    workedHours: 0,
    ...overrides,
  };
}

// Fecha fija para tests: 30 de marzo de 2026
const NOW = new Date(2026, 2, 30, 12, 0, 0); // 30/Mar/2026 12:00

describe('NotificationBell - generateNotifications', () => {
  test('devuelve array vacío cuando no hay tareas', () => {
    const result = generateNotifications([], NOW);
    expect(result).toEqual([]);
  });

  test('devuelve array vacío cuando ninguna tarea tiene dueDate', () => {
    const tasks = [
      createTask({ id: '1', dueDate: null }),
      createTask({ id: '2', dueDate: null }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toEqual([]);
  });

  test('ignora tareas con status Completed', () => {
    const tasks = [
      createTask({ id: '1', status: 'Completed', dueDate: '2026-03-28T10:00:00' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toEqual([]);
  });

  test('detecta tarea vencida (overdue)', () => {
    const tasks = [
      createTask({ id: '1', title: 'Vencida', dueDate: '2026-03-28T10:00:00', status: 'Pending' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('overdue');
    expect(result[0].taskId).toBe('1');
    expect(result[0].id).toBe('overdue-1');
  });

  test('detecta tarea que vence hoy (due-today)', () => {
    const tasks = [
      createTask({ id: '2', title: 'Hoy', dueDate: '2026-03-30T17:00:00', status: 'InProgress' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('due-today');
    expect(result[0].id).toBe('due-today-2');
  });

  test('detecta tarea próxima a vencer en 1 día (due-soon)', () => {
    const tasks = [
      createTask({ id: '3', title: 'Mañana', dueDate: '2026-03-31T10:00:00', status: 'Pending' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('due-soon');
    expect(result[0].id).toBe('due-soon-3');
  });

  test('detecta tarea próxima a vencer en 2 días (due-soon)', () => {
    const tasks = [
      createTask({ id: '4', title: 'Pasado mañana', dueDate: '2026-04-01T10:00:00', status: 'Pending' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('due-soon');
  });

  test('NO genera alerta para tarea con más de 3 días de plazo', () => {
    const tasks = [
      createTask({ id: '5', title: 'Lejana', dueDate: '2026-04-05T10:00:00', status: 'Pending' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toHaveLength(0);
  });

  test('ordena por prioridad: overdue > due-today > due-soon', () => {
    const tasks = [
      createTask({ id: '1', title: 'Pronto', dueDate: '2026-03-31T10:00:00', status: 'Pending' }),
      createTask({ id: '2', title: 'Vencida', dueDate: '2026-03-25T10:00:00', status: 'Pending' }),
      createTask({ id: '3', title: 'Hoy', dueDate: '2026-03-30T15:00:00', status: 'InProgress' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toHaveLength(3);
    expect(result[0].type).toBe('overdue');
    expect(result[1].type).toBe('due-today');
    expect(result[2].type).toBe('due-soon');
  });

  test('genera múltiples notificaciones overdue', () => {
    const tasks = [
      createTask({ id: '1', title: 'Vencida 1', dueDate: '2026-03-25T10:00:00', status: 'Pending' }),
      createTask({ id: '2', title: 'Vencida 2', dueDate: '2026-03-27T10:00:00', status: 'InProgress' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toHaveLength(2);
    expect(result.every(n => n.type === 'overdue')).toBe(true);
  });

  test('mezcla de tareas con y sin dueDate', () => {
    const tasks = [
      createTask({ id: '1', dueDate: null, status: 'Pending' }),
      createTask({ id: '2', dueDate: '2026-03-28T10:00:00', status: 'Pending' }),
      createTask({ id: '3', dueDate: null, status: 'InProgress' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toHaveLength(1);
    expect(result[0].taskId).toBe('2');
  });

  test('todas las notificaciones inician con read=false', () => {
    const tasks = [
      createTask({ id: '1', dueDate: '2026-03-28T10:00:00', status: 'Pending' }),
      createTask({ id: '2', dueDate: '2026-03-30T15:00:00', status: 'Pending' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result.every(n => n.read === false)).toBe(true);
  });

  test('tarea InProgress con dueDate genera notificación', () => {
    const tasks = [
      createTask({ id: '1', status: 'InProgress', dueDate: '2026-03-30T18:00:00' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('due-today');
  });

  test('el mensaje de overdue contiene la fecha de vencimiento', () => {
    const tasks = [
      createTask({ id: '1', dueDate: '2026-03-25T10:00:00', status: 'Pending' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result[0].message).toContain('Venció el');
  });

  test('el mensaje de due-today contiene hora de vencimiento', () => {
    const tasks = [
      createTask({ id: '1', dueDate: '2026-03-30T17:30:00', status: 'Pending' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result[0].message).toContain('Vence hoy');
  });

  test('el mensaje de due-soon contiene la fecha', () => {
    const tasks = [
      createTask({ id: '1', dueDate: '2026-03-31T10:00:00', status: 'Pending' }),
    ];
    const result = generateNotifications(tasks, NOW);
    expect(result[0].message).toContain('Vence el');
  });
});

describe('NotificationBell - Web API integration types', () => {
  test('Task interface tiene campos de fechas', () => {
    const task = createTask({
      startDate: '2026-03-01T09:00:00',
      dueDate: '2026-03-30T17:00:00',
      workedHours: 16,
    });
    expect(task.startDate).toBe('2026-03-01T09:00:00');
    expect(task.dueDate).toBe('2026-03-30T17:00:00');
    expect(task.workedHours).toBe(16);
  });

  test('Task sin fechas tiene valores null/0 por defecto', () => {
    const task = createTask();
    expect(task.startDate).toBeNull();
    expect(task.dueDate).toBeNull();
    expect(task.workedHours).toBe(0);
  });

  test('estados válidos de tareas', () => {
    const validStatuses = ['Pending', 'InProgress', 'Completed'];
    validStatuses.forEach(status => {
      const task = createTask({ status });
      expect(validStatuses).toContain(task.status);
    });
  });

  test('prioridades válidas de tareas', () => {
    const validPriorities = ['Low', 'Medium', 'High'];
    validPriorities.forEach(priority => {
      const task = createTask({ priority });
      expect(validPriorities).toContain(task.priority);
    });
  });
});
