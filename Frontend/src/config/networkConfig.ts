/**
 * 📱 Configuración de Red para Aplicación Móvil
 * 
 * Esta configuración permite que la app funcione en diferentes entornos:
 * - WiFi local
 * - Datos móviles (4G/5G)
 * - Redes públicas/privadas
 * 
 * Soporta detección automática de tipo de conexión y fallback a alternativas
 */

import { Platform } from 'react-native';

/**
 * Tipos de conexión de red soportados
 */
export enum NetworkType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  UNKNOWN = 'unknown',
  NONE = 'none'
}

/**
 * Configuración base de endpoints disponibles
 * Intenta conectar a múltiples URLs en orden de preferencia
 */
export const NETWORK_ENDPOINTS = {
  // IP local de la máquina en la red (para desarrollo con emulador/dispositivo en red local)
  LOCAL_NETWORK: 'http://192.168.1.XX:5000',
  
  // Localhost para emulador de Android (10.0.2.2 es la forma de acceder a localhost desde Android)
  ANDROID_EMULATOR: 'http://10.0.2.2:5000',
  
  // Localhost para emulador de iOS
  IOS_EMULATOR: 'http://localhost:5000',
  
  // Máquina física (si ejecuta en dispositivo físico en misma red)
  PHYSICAL_DEVICE: 'http://192.168.1.XX:5000',
  
  // URL de producción (cuando esté disponible)
  PRODUCTION: process.env.REACT_APP_PROD_API_URL || 'https://api.taskservice.prod',
} as const;

/**
 * Configuración de reintentos para conexiones fallidas
 */
export const RETRY_CONFIG = {
  // Número máximo de reintentos antes de fallar
  MAX_ATTEMPTS: 3,
  
  // Tiempo inicial de espera entre reintentos (ms)
  INITIAL_DELAY: 1000,
  
  // Factor multiplicador para backoff exponencial
  BACKOFF_MULTIPLIER: 2,
  
  // Tiempo máximo de espera entre reintentos (ms)
  MAX_DELAY: 10000,
  
  // Códigos HTTP que justifican reintentos
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504]
} as const;

/**
 * Timeout para diferentes tipos de operaciones (ms)
 */
export const TIMEOUTS = {
  // Para operaciones de lectura normales
  READ: 30000,
  
  // Para operaciones de escritura (pueden ser más lentas)
  WRITE: 60000,
  
  // Para conexión inicial
  CONNECT: 10000,
  
  // Para respuesta de servidor
  RESPONSE: 20000
} as const;

/**
 * Configuración de headers
 */
export const HEADERS = {
  // API Key requerida
  'X-API-KEY': process.env.REACT_APP_API_KEY || '',
  
  // Content-Type
  'Content-Type': 'application/json',
  
  // Accept encoding
  'Accept-Encoding': 'gzip, deflate',
  
  // Accept language (se puede setear dinámicamente)
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  
  // User agent personalizado
  'User-Agent': `TaskService-Mobile/${Platform.OS}`
} as const;

/**
 * Configuración de caché
 */
export const CACHE_CONFIG = {
  // Habilitar caché de respuestas
  ENABLED: true,
  
  // Tiempo de vida del caché (ms)
  TTL: 5 * 60 * 1000, // 5 minutos
  
  // Tamaño máximo del caché en items
  MAX_SIZE: 100,
  
  // Métodos HTTP que se cachean
  CACHEABLE_METHODS: ['GET']
} as const;

/**
 * Configuración de compresión
 */
export const COMPRESSION = {
  // Habilitar compresión de respuestas (importante para datos móviles)
  ENABLED: true,
  
  // Tamaño mínimo de payload para comprimir (bytes)
  MIN_SIZE: 1024
} as const;

/**
 * Resolución automática de endpoint basada en el entorno
 */
export function getApiUrl(): string {
  const env = process.env.REACT_APP_ENV || 'development';
  const isProduction = env === 'production';
  
  if (isProduction) {
    return NETWORK_ENDPOINTS.PRODUCTION;
  }
  
  // En desarrollo, intentar detectar la configuración correcta
  if (Platform.OS === 'android') {
    // Android emulador: 10.0.2.2 apunta a localhost de la máquina host
    return NETWORK_ENDPOINTS.ANDROID_EMULATOR;
  } else if (Platform.OS === 'ios') {
    // iOS emulador: localhost funciona directamente
    return NETWORK_ENDPOINTS.IOS_EMULATOR;
  } else {
    // Web o fallback
    return process.env.REACT_APP_API_URL || NETWORK_ENDPOINTS.LOCAL_NETWORK;
  }
}

/**
 * Obtener todas las URLs posibles en orden de preferencia
 * Útil para implementar fallback automático
 */
export function getFallbackUrls(): string[] {
  if (Platform.OS === 'android') {
    return [
      NETWORK_ENDPOINTS.ANDROID_EMULATOR,
      NETWORK_ENDPOINTS.LOCAL_NETWORK,
      NETWORK_ENDPOINTS.PHYSICAL_DEVICE
    ];
  } else if (Platform.OS === 'ios') {
    return [
      NETWORK_ENDPOINTS.IOS_EMULATOR,
      NETWORK_ENDPOINTS.LOCAL_NETWORK,
      NETWORK_ENDPOINTS.PHYSICAL_DEVICE
    ];
  } else {
    return [
      process.env.REACT_APP_API_URL || NETWORK_ENDPOINTS.LOCAL_NETWORK
    ];
  }
}

/**
 * Configuración consolidada de la aplicación
 */
export const NetworkConfig = {
  // URL base de la API
  baseURL: getApiUrl(),
  
  // URLs de fallback
  fallbackURLs: getFallbackUrls(),
  
  // Headers por defecto
  headers: HEADERS,
  
  // Timeout por defecto
  timeout: TIMEOUTS.READ,
  
  // Configuración de reintentos
  retryConfig: RETRY_CONFIG,
  
  // Configuración de caché
  cacheConfig: CACHE_CONFIG,
  
  // Configuración de compresión
  compression: COMPRESSION,
  
  // Información de plataforma
  platform: Platform.OS,
  platformVersion: Platform.OS === 'android' ? (Platform.Version as number) : undefined
};

export default NetworkConfig;
