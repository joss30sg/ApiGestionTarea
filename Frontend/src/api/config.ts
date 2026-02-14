import { Platform } from 'react-native';

/**
 * Configuración de la API
 * 
 * Las variables de entorno se cargan desde:
 * - .env.local (desarrollo local)
 * - .env.staging (entorno staging)
 * - .env.production (producción)
 * 
 * Variables soportadas:
 * - REACT_APP_API_KEY: API Key para autenticación (nunca hardcodear)
 * - REACT_APP_API_URL: URL base de la API
 * - REACT_APP_ENV: Entorno (development, staging, production)
 */

// URL base de la API
export const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api');

// API Key para autenticación
// IMPORTANTE: Nunca hardcodear en producción
export const API_KEY = process.env.REACT_APP_API_KEY || '123456';

// Entorno actual
export const ENVIRONMENT = process.env.REACT_APP_ENV || 'development';

// Verificar si estamos en producción
export const IS_PRODUCTION = ENVIRONMENT === 'production';

// Log de advertencia en desarrollo si se usa API Key por defecto
if (!IS_PRODUCTION && API_KEY === '123456') {
  console.warn(
    '⚠️ [Config] Usando API Key por defecto. En producción, establece REACT_APP_API_KEY en variables de entorno.'
  );
}