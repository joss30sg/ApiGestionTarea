import axios, { AxiosError, AxiosInstance } from 'axios';
import { BASE_URL, API_KEY, ENVIRONMENT } from './config';

/**
 * Cliente HTTP ampliado para la API de tareas
 * 
 * Características:
 * - Inyección automática de API Key en headers
 * - Validación de estructura de respuesta
 * - Manejo de errores centralizado
 * - Timeouts configurados
 * - Reintentos automáticos en errores de red
 * - Logs en desarrollo
 */

/**
 * ✅ CRÍTICO: Reintentos automáticos con backoff exponencial
 * Previene fallos por conexiones inestables o timeouts temporales
 */
const maxRetries = 3;
const retryDelay = 1000; // 1 segundo

/**
 * ✅ CRÍTICO: Validar que la respuesta sea un objeto JSON válido
 * Previene crashes cuando la API devuelve texto plano o JSON inválido
 */
const validateResponse = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  return true;
};

/**
 * ✅ CRÍTICO: Validar estructura específica de respuestas paginadas
 */
const validatePagedResponse = (data: unknown): boolean => {
  if (!validateResponse(data)) return false;
  const response = data as any;
  return Array.isArray(response.items) && 
         typeof response.totalCount === 'number' &&
         typeof response.pageNumber === 'number' &&
         typeof response.pageSize === 'number';
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * ✅ CRÍTICO: Configurar reintentos automáticos
 * Reintenta en errores de red, timeouts, o status 429
 */
apiClient.interceptors.response.use(
  (response) => {
    // ✅ CRÍTICO: Validar estructura de respuesta
    if (response.data && typeof response.data === 'object') {
      // Validación adicional según el endpoint
      const url = response.config.url || '';
      if (url.includes('/api/tasks') && !url.includes('/api/tasks/')) {
        // GET /api/tasks - respuesta paginada
        if (!validatePagedResponse(response.data)) {
          console.warn('⚠️ [API] Estructura de respuesta inválida para listado paginado');
          response.data = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10 };
        }
      }
    } else if (response.status === 200) {
      console.warn('⚠️ [API] Respuesta vacía o inválida');
    }

    // Log en desarrollo (sin datos sensibles)
    if (ENVIRONMENT === 'development') {
      console.log(`✅ [API] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    // Verificar si ya hemos reintentado
    const config = error.config as any;
    config.retryCount = config.retryCount || 0;

    // Decidir si reintentar
    const shouldRetry = 
      (error.response?.status === 429 || // Too Many Requests
       error.code === 'ECONNABORTED' ||  // Timeout
       error.code === 'ECONNREFUSED' ||  // Conexión rechazada
       error.code === 'ETIMEDOUT' ||     // Timeout
       !error.response) &&                // Sin respuesta (network error)
      config.retryCount < maxRetries;

    if (shouldRetry) {
      config.retryCount += 1;
      const delay = retryDelay * Math.pow(2, config.retryCount - 1); // Backoff exponencial
      console.warn(`⚠️ [API] Reintentando (${config.retryCount}/${maxRetries}) en ${delay}ms...`);
      
      return new Promise(resolve => 
        setTimeout(() => resolve(apiClient.request(config)), delay)
      );
    }

    // Log de error (sin datos sensibles)
    if (ENVIRONMENT === 'development') {
      console.error(`❌ [API] Error en ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
      });
    }

    // Manejo específico de errores
    if (error.response?.status === 401) {
      console.warn('⚠️ [API] No autorizado. Verifica la API Key.');
    } else if (error.response?.status === 403) {
      console.warn('⚠️ [API] Acceso prohibido.');
    } else if (error.response?.status === 404) {
      console.warn('⚠️ [API] Recurso no encontrado.');
    } else if (error.response?.status === 429) {
      console.warn('⚠️ [API] Demasiadas solicitudes. Por favor, intenta más tarde.');
    } else if (error.response?.status === 500) {
      console.error('❌ [API] Error interno del servidor.');
    } else if (error.code === 'ECONNABORTED') {
      console.error('❌ [API] Timeout - La solicitud tardó demasiado (>30s).');
    } else if (error.message === 'Network Error') {
      console.error('❌ [API] Error de red - Verifica la conectividad y que la URL es correcta.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;