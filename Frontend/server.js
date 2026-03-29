const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const app = express();
const PORT = 8080;
const BACKEND_URL = 'http://localhost:5000';

// ── Logging centralizado ──
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const logStream = fs.createWriteStream(
  path.join(LOG_DIR, `server-${new Date().toISOString().slice(0, 10)}.log`),
  { flags: 'a' }
);

function log(level, msg, meta = {}) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    msg,
    ...meta,
  });
  logStream.write(entry + '\n');
  const prefix = { INF: '✅', WRN: '⚠️', ERR: '❌' }[level] || 'ℹ️';
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${prefix} ${msg}`,
    Object.keys(meta).length ? meta : '');
}

// Middleware de logging para requests HTTP
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const lvl = res.statusCode >= 500 ? 'ERR' : res.statusCode >= 400 ? 'WRN' : 'INF';
    log(lvl, `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms,
    });
  });
  next();
});

// Configuración de axios
const backendClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'X-API-Key': '123456'
  }
});

// Parse JSON body
app.use(express.json());

// SSE: clientes conectados para tiempo real
const sseClients = new Set();

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('data: connected\n\n');
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

function broadcast(event, payload) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    client.write(msg);
  }
}

// Servir archivos estáticos desde la carpeta dist (build de React/Vite)
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');
const STATIC_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : PUBLIC_DIR;
app.use(express.static(STATIC_DIR));

// Proxy para API tasks - GET
app.get('/api/proxy/tasks', async (req, res) => {
  try {
    const response = await backendClient.get('/api/tasks', {
      params: req.query
    });
    
    res.json(response.data);
  } catch (error) {
    log('ERR', 'Proxy GET /tasks falló', { error: error.message });
    res.status(500).json({
      error: 'Error al conectar con el backend',
      details: error.message,
      backendUrl: BACKEND_URL
    });
  }
});

// Proxy para API tasks - POST (crear)
app.post('/api/proxy/tasks', async (req, res) => {
  try {
    const response = await backendClient.post('/api/tasks', req.body);
    res.status(response.status).json(response.data);
    broadcast('task-change', { action: 'create' });
  } catch (error) {
    log('ERR', 'Proxy POST /tasks falló', { error: error.message });
    const status = error.response?.status || 500;
    res.status(status).json(error.response?.data || { error: error.message });
  }
});

// Proxy para API tasks - PUT (actualizar)
app.put('/api/proxy/tasks/:id', async (req, res) => {
  try {
    const response = await backendClient.put(`/api/tasks/${req.params.id}`, req.body);
    res.status(response.status).json(response.data);
    broadcast('task-change', { action: 'update', id: req.params.id });
  } catch (error) {
    log('ERR', `Proxy PUT /tasks/${req.params.id} falló`, { error: error.message });
    const status = error.response?.status || 500;
    res.status(status).json(error.response?.data || { error: error.message });
  }
});

// Proxy para API tasks - DELETE (eliminar)
app.delete('/api/proxy/tasks/:id', async (req, res) => {
  try {
    const response = await backendClient.delete(`/api/tasks/${req.params.id}`);
    res.status(204).send();
    broadcast('task-change', { action: 'delete', id: req.params.id });
  } catch (error) {
    log('ERR', `Proxy DELETE /tasks/${req.params.id} falló`, { error: error.message });
    const status = error.response?.status || 500;
    res.status(status).json(error.response?.data || { error: error.message });
  }
});

// Servir el index.html para todas las rutas (SPA)
app.use((req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  log('INF', 'Servidor web iniciado', { port: PORT, backend: BACKEND_URL, static: STATIC_DIR });
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🚀 SERVIDOR WEB INICIADO                                      ║
╚════════════════════════════════════════════════════════════════╝

  🌐 URL LOCAL: http://localhost:${PORT}
  📁 Sirviendo: ${path.join(__dirname, 'public')}
  
  ✅ Interfaz de gestión de tareas lista (React)
  ✅ Conectando con API en http://localhost:5000
  📂 Sirviendo desde: ${STATIC_DIR}
  📝 Logs en: ${LOG_DIR}
  
  Presiona Ctrl+C para detener
  `);
});
