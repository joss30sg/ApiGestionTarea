export interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface TaskPayload {
  title: string;
  description: string;
  priority: string;
  state: string;
}

export interface PagedResult {
  items: Task[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

const BASE = '/api/proxy/tasks';

export async function fetchTasks(pageNumber = 1, pageSize = 50): Promise<PagedResult> {
  const res = await fetch(`${BASE}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    items: data.items || [],
    totalCount: data.totalCount ?? 0,
    pageNumber: data.pageNumber ?? pageNumber,
    pageSize: data.pageSize ?? pageSize,
  };
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateTask(id: string, payload: TaskPayload): Promise<Task> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
}
