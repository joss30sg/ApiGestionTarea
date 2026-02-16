const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = 8080;
const BACKEND_URL = 'http://192.168.18.8:5000';

// Configuración de axios
const backendClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'X-API-Key': '123456'
  }
});

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Proxy para API tasks
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

// Servir el index.html para todas las rutas (SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🚀 SERVIDOR WEB INICIADO                                      ║
╚════════════════════════════════════════════════════════════════╝

  🌐 URL LOCAL: http://localhost:${PORT}
  🌐 URL RED: http://192.168.18.8:${PORT}
  📁 Sirviendo: ${path.join(__dirname, 'public')}
  
  ✅ Interfaz de gestión de tareas lista
  ✅ Conectando con API en http://192.168.18.8:5000
  
  Presiona Ctrl+C para detener
  `);
});
