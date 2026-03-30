const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Extraer rol del JWT (solo metadata, sin exponer token)
function extractRole(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || 'User';
  } catch { return 'User'; }
}

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

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

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
    'X-API-Key': process.env.API_KEY
  }
});

// Parse JSON body
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Validar formato UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id) {
  return UUID_REGEX.test(id);
}

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

// Proxy para AUTH - Login (token se guarda en httpOnly cookie)
app.post('/api/proxy/auth/login', async (req, res) => {
  try {
    const response = await backendClient.post('/api/auth/login', req.body);
    const { accessToken, refreshToken, expiresIn, tokenType } = response.data;
    
    // Guardar token en cookie httpOnly (no accesible via JS)
    res.cookie('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn * 1000,
      path: '/'
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/api/proxy/auth'
    });
    
    // Devolver solo metadatos (sin tokens sensibles)
    res.status(response.status).json({
      expiresIn,
      tokenType,
      role: extractRole(accessToken)
    });
  } catch (error) {
    log('ERR', 'Proxy POST /auth/login falló', { error: error.message });
    const status = error.response?.status || 500;
    res.status(status).json(error.response?.data || { error: 'Error de autenticación' });
  }
});

// Proxy para AUTH - Logout (limpiar cookies)
app.post('/api/proxy/auth/logout', (req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/proxy/auth' });
  res.status(200).json({ message: 'Sesión cerrada' });
});

// Proxy para AUTH - Refresh (usar refresh_token de cookie)
app.post('/api/proxy/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: 'No hay sesión activa', code: 'NO_SESSION' });
    }
    const response = await backendClient.post('/api/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken, expiresIn, tokenType } = response.data;
    
    res.cookie('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn * 1000,
      path: '/'
    });
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/proxy/auth'
    });
    
    res.status(200).json({ expiresIn, tokenType, role: extractRole(accessToken) });
  } catch (error) {
    log('ERR', 'Proxy POST /auth/refresh falló', { error: error.message });
    res.clearCookie('auth_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/proxy/auth' });
    const status = error.response?.status || 500;
    res.status(status).json(error.response?.data || { error: 'Sesión expirada' });
  }
});

// Proxy para AUTH - Register
app.post('/api/proxy/auth/register', async (req, res) => {
  try {
    const response = await backendClient.post('/api/auth/register', req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    log('ERR', 'Proxy POST /auth/register falló', { error: error.message });
    const status = error.response?.status || 500;
    res.status(status).json(error.response?.data || { error: 'Error al registrar' });
  }
});

// Helper: construir headers con auth desde cookie httpOnly
function authHeaders(req) {
  const token = req.cookies?.auth_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Proxy para API tasks - GET
app.get('/api/proxy/tasks', async (req, res) => {
  try {
    const response = await backendClient.get('/api/tasks', {
      params: req.query,
      headers: authHeaders(req)
    });
    
    res.json(response.data);
  } catch (error) {
    log('ERR', 'Proxy GET /tasks falló', { error: error.message });
    res.status(error.response?.status || 500).json({
      error: 'Error al conectar con el backend',
      code: 'BACKEND_UNAVAILABLE'
    });
  }
});

// Proxy para API tasks - POST (crear)
app.post('/api/proxy/tasks', async (req, res) => {
  try {
    const response = await backendClient.post('/api/tasks', req.body, {
      headers: authHeaders(req)
    });
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
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido', code: 'INVALID_ID' });
    }
    const response = await backendClient.put(`/api/tasks/${req.params.id}`, req.body, {
      headers: authHeaders(req)
    });
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
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido', code: 'INVALID_ID' });
    }
    const response = await backendClient.delete(`/api/tasks/${req.params.id}`, {
      headers: authHeaders(req)
    });
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
