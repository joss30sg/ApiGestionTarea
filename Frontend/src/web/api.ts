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

const BASE = '/api/proxy/tasks';

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE}?pageSize=50`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items || [];
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
