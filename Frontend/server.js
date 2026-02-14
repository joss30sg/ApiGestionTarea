const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 8080;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces
const LOCAL_IP = '192.168.18.8'; // IP local de tu PC

// Configuración
const API_URL = `http://${LOCAL_IP}:5000/api`;
const API_KEY = '123456';

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// CORS para permitir requests desde dispositivos en la red
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// API Proxy - GET TASKS
app.get('/api/proxy/tasks', async (req, res) => {
  try {
    const { state, priority, pageNumber = 1, pageSize = 10 } = req.query;
    
    const params = {};
    if (state) params.state = state;
    if (priority) params.priority = priority;
    params.pageNumber = pageNumber;
    params.pageSize = pageSize;

    const response = await axios.get(`${API_URL}/tasks`, {
      headers: { 'X-API-Key': API_KEY },
      params
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Servir página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`\n✅ Servidor Express corriendo en http://${LOCAL_IP}:${PORT}`);
  console.log(`📱 Desde PC: http://localhost:${PORT}`);
  console.log(`📱 Desde Android en WiFi: http://${LOCAL_IP}:${PORT}\n`);
  console.log(`⚙️  Backend API: ${API_URL}`);
  console.log(`🔑 API Key: ${API_KEY}\n`);
});
