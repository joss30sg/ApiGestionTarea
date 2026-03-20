const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = 8080;
const BACKEND_URL = 'http://localhost:5000';

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

// Servir archivos estáticos desde la carpeta dist (build de React/Vite)
const fs = require('fs');
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
    console.error('Error en proxy:', error.message);
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
  } catch (error) {
    console.error('Error en proxy POST:', error.message);
    const status = error.response?.status || 500;
    res.status(status).json(error.response?.data || { error: error.message });
  }
});

// Proxy para API tasks - PUT (actualizar)
app.put('/api/proxy/tasks/:id', async (req, res) => {
  try {
    const response = await backendClient.put(`/api/tasks/${req.params.id}`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error en proxy PUT:', error.message);
    const status = error.response?.status || 500;
    res.status(status).json(error.response?.data || { error: error.message });
  }
});

// Proxy para API tasks - DELETE (eliminar)
app.delete('/api/proxy/tasks/:id', async (req, res) => {
  try {
    const response = await backendClient.delete(`/api/tasks/${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error en proxy DELETE:', error.message);
    const status = error.response?.status || 500;
    res.status(status).json(error.response?.data || { error: error.message });
  }
});

// Servir el index.html para todas las rutas (SPA)
app.use((req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🚀 SERVIDOR WEB INICIADO                                      ║
╚════════════════════════════════════════════════════════════════╝

  🌐 URL LOCAL: http://localhost:${PORT}
  📁 Sirviendo: ${path.join(__dirname, 'public')}
  
  ✅ Interfaz de gestión de tareas lista (React)
  ✅ Conectando con API en http://localhost:5000
  📂 Sirviendo desde: ${STATIC_DIR}
  
  Presiona Ctrl+C para detener
  `);
});
