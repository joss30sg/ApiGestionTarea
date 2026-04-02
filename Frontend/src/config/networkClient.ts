/**
 * 🌐 Cliente HTTP Avanzado con Soporte para Red Móvil
 * 
 * Características:
 * - Reintentos automáticos con backoff exponencial
 * - Caché de respuestas
 * - Detección de tipo de conexión
 * - Compresión de datos
 * - Múltiples URLs de fallback
 * - Manejo robusto de errores
 * 
 * 📡 ENDPOINTS DISPONIBLES:
 * 
 * GET /api/tasks
 *   - Obtiene listado paginado de tareas
 *   - Headers requeridos: X-API-Key (configurar via REACT_APP_API_KEY)
 *   - Query params: pageNumber=1, pageSize=10, state, priority
 *   - Ejemplo:
 *     networkClient.get('/api/tasks?pageNumber=1&pageSize=10&state=Pending&priority=High')
 * 
 * GET /api/tasks/{id}
 *   - Obtiene detalles de una tarea específica
 *   - Headers requeridos: X-API-Key (configurar via REACT_APP_API_KEY)
 *   - Parámetro: id (GUID)
 *   - Ejemplo:
 *     networkClient.get('/api/tasks/550e8400-e29b-41d4-a716-446655440000')
 * 
 * 🔑 AUTENTICACION:
 * Todas las solicitudes a /api/* requieren el header X-API-Key
 * El networkClient lo incluye automáticamente en networkConfig.ts
 * Configurar via variable de entorno REACT_APP_API_KEY
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import NetworkConfig, {
  RETRY_CONFIG,
  TIMEOUTS,
  CACHE_CONFIG,
  COMPRESSION,
  NetworkType,
  getFallbackUrls
} from './networkConfig';

/**
 * Caché en memoria para respuestas GET
 */
class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  
  /**
   * Obtener item del caché
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Verificar si expiró
    const age = Date.now() - item.timestamp;
    if (age > CACHE_CONFIG.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  /**
   * Guardar item en caché
   */
  set(key: string, data: any): void {
    // Limitar tamaño del caché
    if (this.cache.size >= CACHE_CONFIG.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Limpiar caché
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Limpiar caché expirado
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > CACHE_CONFIG.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Cliente HTTP personalizado con características avanzadas
 */
export class NetworkClient {
  private axiosInstance: AxiosInstance;
  private cache: ResponseCache;
  private currentUrlIndex: number = 0;
  private urlList: string[];
  
  constructor() {
    this.cache = new ResponseCache();
    this.urlList = getFallbackUrls();
    
    // Crear instancia de axios con URL inicial
    this.axiosInstance = axios.create({
      baseURL: this.urlList[0],
      timeout: TIMEOUTS.READ,
      headers: NetworkConfig.headers,
      // ✅ SEGURIDAD: Prevenir SSRF por URLs absolutas (CVE-2025-27152)
      allowAbsoluteUrls: false,
    });
    
    // Configurar interceptores
    this.setupInterceptors();
    
    // Limpiar caché periódicamente
    setInterval(() => this.cache.cleanup(), 60000); // Cada minuto
  }
  
  /**
   * Configurar interceptores para manejo de errores y reintentos
   */
  private setupInterceptors(): void {
    // Interceptor de respuesta para manejar errores y fallbacks
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;
        
        // Si no hay retry count, inicializarlo
        if (!config.__retryCount) {
          config.__retryCount = 0;
        }
        
        // Verificar si se debe reintentar
        const shouldRetry = 
          config.__retryCount < RETRY_CONFIG.MAX_ATTEMPTS &&
          (error.response?.status === undefined || 
           RETRY_CONFIG.RETRYABLE_STATUS_CODES.includes(error.response?.status as any));
        
        if (shouldRetry) {
          config.__retryCount++;
          
          // Calcular delay con backoff exponencial
          const delay = Math.min(
            RETRY_CONFIG.INITIAL_DELAY * 
            Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, config.__retryCount - 1),
            RETRY_CONFIG.MAX_DELAY
          );
          
          if (__DEV__ || process.env.REACT_APP_ENV === 'development') {
            console.log(
              `[Network] Reintentando solicitud (${config.__retryCount}/${RETRY_CONFIG.MAX_ATTEMPTS}) ` +
              `en ${delay}ms`
            );
          }
          
          // Esperar antes de reintentar
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Intentar con siguiente URL si está disponible
          if (!error.response || error.response.status >= 500) {
            this.tryNextUrl();
          }
          
          return this.axiosInstance.request(config);
        }
        
        // Si ya se acabaron los reintentos, rechazar
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Cambiar a siguiente URL de fallback
   */
  private tryNextUrl(): void {
    this.currentUrlIndex++;
    if (this.currentUrlIndex < this.urlList.length) {
      const nextUrl = this.urlList[this.currentUrlIndex];
      
      // ✅ SEGURIDAD: Validar que la URL de fallback pertenece a un origen permitido
      try {
        const parsed = new URL(nextUrl);
        const trustedHosts = ['localhost', '10.0.2.2', '127.0.0.1'];
        const isPrivateIP = /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./;
        const isTrusted = trustedHosts.includes(parsed.hostname) || 
                          isPrivateIP.test(parsed.hostname) ||
                          parsed.protocol === 'https:';
        if (!isTrusted) {
          console.warn(`[Network] URL de fallback no confiable descartada`);
          return;
        }
      } catch {
        return;
      }
      
      if (__DEV__ || process.env.REACT_APP_ENV === 'development') {
        console.log(`[Network] Intentando con URL alternativa`);
      }
      
      // Actualizar baseURL
      this.axiosInstance.defaults.baseURL = nextUrl;
    }
  }
  
  /**
   * Resetear a primera URL (útil después de cambios de red)
   * 
   * EJEMPLO:
   * networkClient.resetUrl(); // Vuelve a http://localhost:5000/api
   */
  public resetUrl(): void {
    this.currentUrlIndex = 0;
    this.axiosInstance.defaults.baseURL = this.urlList[0];
    console.log(`[Network] URL resetea a: ${this.urlList[0]}`);
  }
  
  /**
   * GET con soporte para caché
   * 
   * EJEMPLOS DE USO:
   * 
   * 1. Obtener todas las tareas:
   *    const tasks = await networkClient.get('/api/tasks');
   * 
   * 2. Obtener tareas con filtros:
   *    const pendingTasks = await networkClient.get(
   *      '/api/tasks?state=Pending&priority=High&pageNumber=1&pageSize=20'
   *    );
   * 
   * 3. Obtener tarea específica por ID:
   *    const task = await networkClient.get('/api/tasks/550e8400-e29b-41d4-a716-446655440000');
   * 
   * @template T Tipo de datos esperado en la respuesta
   * @param url Endpoint de la API (e.g., '/api/tasks')
   * @param config Configuración adicional de axios (opcional)
   * @returns Promise<T> Datos de la respuesta (caché si está disponible)
   */
  async get<T>(url: string, config?: any): Promise<T> {
    // Intentar obtener del caché
    if (CACHE_CONFIG.ENABLED) {
      const cachedData = this.cache.get(url);
      if (cachedData) {
        console.log(`[Cache] HIT para ${url}`);
        return cachedData;
      }
    }
    
    // Si no está en caché, hacer la solicitud
    console.log(`[Network] GET ${url}`);
    const response = await this.axiosInstance.get<T>(url, config);
    
    // Guardar en caché
    if (CACHE_CONFIG.ENABLED) {
      this.cache.set(url, response.data);
    }
    
    return response.data;
  }
  
  /**
   * POST - Crear nuevos recursos, invalida caché automáticamente
   * 
   * EJEMPLOS DE USO:
   * 
   * 1. Crear una nueva tarea:
   *    const newTask = await networkClient.post('/api/tasks', {
   *      title: 'Mi Nueva Tarea',
   *      description: 'Descripción detallada',
   *      priority: 'High',
   *      status: 'Pending'
   *    });
   * 
   * 2. Con configuración personalizada:
   *    const response = await networkClient.post('/api/tasks', data, {
   *      timeout: 30000
   *    });
   * 
   * Nota: POST automáticamente limpia el caché para sincronización
   * 
   * @template T Tipo de datos esperado en la respuesta
   * @param url Endpoint de la API
   * @param data Datos a enviar en el body
   * @param config Configuración adicional de axios (opcional)
   * @returns Promise<T> Datos de la respuesta
   */
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    console.log(`[Network] POST ${url}`);
    const response = await this.axiosInstance.post<T>(url, data, config);
    
    // Invalidar caché relacionado después de POST
    this.cache.clear();
    
    return response.data;
  }
  
  /**
   * PUT - Actualizar recursos completos, invalida caché automáticamente
   * 
   * EJEMPLOS DE USO:
   * 
   * 1. Actualizar una tarea completa:
   *    const updatedTask = await networkClient.put(
   *      '/api/tasks/550e8400-e29b-41d4-a716-446655440000',
   *      {
   *        title: 'Tarea Actualizada',
   *        description: 'Nueva descripción',
   *        priority: 'Medium',
   *        status: 'InProgress'
   *      }
   *    );
   * 
   * 2. Con timeout personalizado:
   *    const response = await networkClient.put(url, data, { timeout: 20000 });
   * 
   * Nota: PUT automáticamente limpia el caché después de actualizar
   * 
   * @template T Tipo de datos esperado en la respuesta
   * @param url Endpoint de la API con ID
   * @param data Datos completos del recurso a actualizar
   * @param config Configuración adicional de axios (opcional)
   * @returns Promise<T> Datos actualizados
   */
  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    console.log(`[Network] PUT ${url}`);
    const response = await this.axiosInstance.put<T>(url, data, config);
    
    // Invalidar caché
    this.cache.clear();
    
    return response.data;
  }
  
  /**
   * DELETE - Eliminar recursos, invalida caché automáticamente
   * 
   * EJEMPLOS DE USO:
   * 
   * 1. Eliminar una tarea por ID:
   *    const result = await networkClient.delete(
   *      '/api/tasks/550e8400-e29b-41d4-a716-446655440000'
   *    );
   * 
   * 2. Con manejo de errores:
   *    try {
   *      await networkClient.delete('/api/tasks/{id}');
   *    } catch (error) {
   *      if (error.response?.status === 404) {
   *        console.log('Tarea no encontrada');
   *      }
   *    }
   * 
   * Nota: DELETE automáticamente limpia el caché después de eliminar
   * 
   * @template T Tipo de datos esperado en la respuesta
   * @param url Endpoint de la API con ID
   * @param config Configuración adicional de axios (opcional)
   * @returns Promise<T> Respuesta del servidor (típicamente confirmación)
   */
  async delete<T>(url: string, config?: any): Promise<T> {
    console.log(`[Network] DELETE ${url}`);
    const response = await this.axiosInstance.delete<T>(url, config);
    
    // Invalidar caché
    this.cache.clear();
    
    return response.data;
  }
  
  /**
   * Limpiar caché manualmente
   * 
   * EJEMPLO:
   * networkClient.clearCache(); // Borra todos los datos en caché
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[Cache] Caché limpiado');
  }
  
  /**
   * Obtener URL actual activa
   * 
   * EJEMPLO:
   * const currentUrl = networkClient.getCurrentUrl();
   * console.log(currentUrl); // http://localhost:5000/api
   * 
   * @returns string URL base actual del cliente
   */
  getCurrentUrl(): string {
    return this.axiosInstance.defaults.baseURL as string;
  }
  
  /**
   * Obtener lista de URLs disponibles (fallbacks)
   * 
   * EJEMPLO:
   * const urls = networkClient.getAvailableUrls();
   * console.log(urls); 
   * // ['http://localhost:5000/api', 'http://192.168.18.8:5000/api', ...]
   * 
   * @returns string[] Array de URLs disponibles
   */
  getAvailableUrls(): string[] {
    return this.urlList;
  }
  
  /**
   * Cambiar URL específica (debe estar en lista de URLs disponibles)
   * 
   * EJEMPLO:
   * // Usar servidor local IP
   * networkClient.setUrl('http://192.168.18.8:5000/api');
   * 
   * // Usar servidor de producción
   * networkClient.setUrl('https://api.prod.taskservice.com');
   * 
   * @param url URL a la cual cambiar (debe estar en getAvailableUrls())
   */
  setUrl(url: string): void {
    if (this.urlList.includes(url)) {
      this.currentUrlIndex = this.urlList.indexOf(url);
      this.axiosInstance.defaults.baseURL = url;
      console.log(`[Network] URL cambiada a: ${url}`);
    }
  }
}

/**
 * 📚 EJEMPLOS DE USO COMPLETOS:
 * 
 * OBTENER TODAS LAS TAREAS:
 * import networkClient from './networkClient';
 * 
 * async function loadTasks() {
 *   try {
 *     const tasks = await networkClient.get('/api/tasks');
 *     console.log('Tareas:', tasks);
 *   } catch (error) {
 *     console.error('Error cargando tareas:', error.response?.data);
 *   }
 * }
 * 
 * OBTENER TAREA POR ID:
 * async function getTaskDetails(id: string) {
 *   try {
 *     const task = await networkClient.get(`/api/tasks/${id}`);
 *     return task;
 *   } catch (error) {
 *     if (error.response?.status === 404) {
 *       console.log('Tarea no encontrada');
 *     }
 *   }
 * }
 * 
 * CREAR NUEVA TAREA:
 * async function createTask(title: string, priority: string) {
 *   try {
 *     const newTask = await networkClient.post('/api/tasks', {
 *       title: title,
 *       description: 'Nueva tarea',
 *       priority: priority,
 *       status: 'Pending'
 *     });
 *     networkClient.clearCache(); // Limpiar para forzar recarga
 *     return newTask;
 *   } catch (error) {
 *     console.error('Error creando tarea:', error.response?.data);
 *   }
 * }
 * 
 * ACTUALIZAR TAREA:
 * async function updateTask(id: string, updates: any) {
 *   try {
 *     const updated = await networkClient.put(`/api/tasks/${id}`, updates);
 *     return updated;
 *   } catch (error) {
 *     console.error('Error actualizando:', error.response?.data);
 *   }
 * }
 * 
 * ELIMINAR TAREA:
 * async function deleteTask(id: string) {
 *   try {
 *     await networkClient.delete(`/api/tasks/${id}`);
 *     console.log('Tarea eliminada');
 *   } catch (error) {
 *     if (error.response?.status === 404) {
 *       console.log('Tarea ya no existe');
 *     }
 *   }
 * }
 * 
 * CAMBIAR SERVIDOR:
 * networkClient.setUrl('http://192.168.18.8:5000/api');
 * const tasksFromLocalNet = await networkClient.get('/api/tasks');
 */

/**
 * Instancia singleton del cliente
 */
export const networkClient = new NetworkClient();

export default networkClient;
