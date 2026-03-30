import React from 'react';
import { Task } from '../api';

interface ReportViewProps {
  tasks: Task[];
  onClose: () => void;
}

function groupByStatus(tasks: Task[]) {
  const groups: Record<string, Task[]> = {
    Pending: [],
    InProgress: [],
    Completed: [],
  };
  for (const t of tasks) {
    if (groups[t.status]) groups[t.status].push(t);
    else groups[t.status] = [t];
  }
  return groups;
}

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendientes',
  InProgress: 'En Progreso',
  Completed: 'Completadas',
};

const PRIORITY_LABELS: Record<string, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const UNITS = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
  'treinta', 'treinta y uno'];
const MONTHS_TEXT = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function numberToWords(n: number): string {
  if (n >= 0 && n <= 31) return UNITS[n];
  return String(n);
}

function yearToWords(y: number): string {
  if (y === 2026) return 'dos mil veintiséis';
  if (y === 2025) return 'dos mil veinticinco';
  if (y === 2027) return 'dos mil veintisiete';
  return String(y);
}

function formatDateInWords(): string {
  const now = new Date();
  const day = numberToWords(now.getDate());
  const month = MONTHS_TEXT[now.getMonth()];
  const year = yearToWords(now.getFullYear());
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `Generado el ${day} de ${month} del ${year} a las ${hours}:${minutes}`;
}

function generatePDF(tasks: Task[]) {
  const groups = groupByStatus(tasks);
  const dateLabel = formatDateInWords();

  const tableRows = (list: Task[]) =>
    list.map(t => `
      <tr>
        <td>${escapeHtml(t.title)}</td>
        <td>${escapeHtml(t.description || '—')}</td>
        <td><span class="badge priority-${t.priority.toLowerCase()}">${PRIORITY_LABELS[t.priority] || t.priority}</span></td>
        <td>${formatDate(t.createdAt)}</td>
      </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte de Tareas</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
    .header h1 { font-size: 24px; color: #667eea; }
    .header p { color: #666; font-size: 12px; margin-top: 6px; }
    .summary { display: flex; justify-content: center; gap: 30px; margin-bottom: 30px; }
    .summary-item { text-align: center; padding: 12px 24px; border-radius: 8px; background: #f5f5f7; }
    .summary-item .num { font-size: 28px; font-weight: bold; }
    .summary-item .label { font-size: 11px; color: #666; text-transform: uppercase; }
    .summary-item.pending .num { color: #f59e0b; }
    .summary-item.inprogress .num { color: #3b82f6; }
    .summary-item.completed .num { color: #10b981; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; margin-bottom: 10px; padding: 8px 12px; border-radius: 6px; color: #fff; }
    .section h2.pending { background: #f59e0b; }
    .section h2.inprogress { background: #3b82f6; }
    .section h2.completed { background: #10b981; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 13px; }
    th { background: #f0f0f5; text-align: left; padding: 8px 10px; border-bottom: 2px solid #ddd; }
    td { padding: 7px 10px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) { background: #fafafa; }
    .badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .priority-low { background: #dcfce7; color: #166534; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-high { background: #fee2e2; color: #991b1b; }
    .empty { color: #999; font-style: italic; padding: 12px; }
    .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Reporte de Tareas</h1>
    <p>${dateLabel}</p>
  </div>

  <div class="summary">
    <div class="summary-item pending">
      <div class="num">${groups.Pending.length}</div>
      <div class="label">Pendientes</div>
    </div>
    <div class="summary-item inprogress">
      <div class="num">${groups.InProgress.length}</div>
      <div class="label">En Progreso</div>
    </div>
    <div class="summary-item completed">
      <div class="num">${groups.Completed.length}</div>
      <div class="label">Completadas</div>
    </div>
  </div>

  ${Object.entries(groups).map(([status, list]) => `
    <div class="section">
      <h2 class="${status.toLowerCase()}">${STATUS_LABELS[status] || status} (${list.length})</h2>
      ${list.length === 0
        ? '<p class="empty">No hay tareas en este estado.</p>'
        : `<table>
            <thead><tr><th>Título</th><th>Descripción</th><th>Prioridad</th><th>Fecha</th></tr></thead>
            <tbody>${tableRows(list)}</tbody>
          </table>`
      }
    </div>`).join('')}

  <div class="footer">
    API de Gestión de Tareas — Total: ${tasks.length} tareas
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    URL.revokeObjectURL(url);
    alert('Por favor permite las ventanas emergentes para descargar el PDF.');
    return;
  }
  printWindow.onload = () => {
    printWindow.print();
    URL.revokeObjectURL(url);
  };
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default function ReportView({ tasks, onClose }: ReportViewProps) {
  const groups = groupByStatus(tasks);

  return (
    <div className="report-overlay">
      <div className="report-panel">
        <div className="report-header">
          <div>
            <h2>📊 Reporte de Tareas</h2>
          </div>
          <div className="report-actions">
            <button className="report-download-btn" onClick={() => generatePDF(tasks)}>
              📥 Descargar PDF
            </button>
            <button className="report-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="report-summary">
          <div className="report-stat pending">
            <span className="report-stat-num">{groups.Pending.length}</span>
            <span className="report-stat-label">Pendientes</span>
          </div>
          <div className="report-stat inprogress">
            <span className="report-stat-num">{groups.InProgress.length}</span>
            <span className="report-stat-label">En Progreso</span>
          </div>
          <div className="report-stat completed">
            <span className="report-stat-num">{groups.Completed.length}</span>
            <span className="report-stat-label">Completadas</span>
          </div>
        </div>

        {Object.entries(groups).map(([status, list]) => (
          <div key={status} className="report-section">
            <h3 className={`report-section-title ${status.toLowerCase()}`}>
              {STATUS_LABELS[status] || status} ({list.length})
            </h3>
            {list.length === 0 ? (
              <p className="report-empty">No hay tareas en este estado.</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Prioridad</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(t => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td>{t.description || '—'}</td>
                      <td>
                        <span className={`badge-priority priority-${t.priority.toLowerCase()}`}>
                          {PRIORITY_LABELS[t.priority] || t.priority}
                        </span>
                      </td>
                      <td>{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
