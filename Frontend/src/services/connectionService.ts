/**
 * 📶 Servicio de Detección de Conexión de Red
 * 
 * Monitorea cambios en la conexión de red (WiFi ↔ Datos móviles)
 * y notifica a los componentes interesados
 */

import { useEffect, useState, useRef } from 'react';

/**
 * Estados posibles de la conexión
 */
export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CHECKING = 'checking'
}

/**
 * Tipos de conexión disponibles
 */
export enum ConnectionType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  UNKNOWN = 'unknown',
  NONE = 'none'
}

/**
 * Información detallada de la conexión
 */
export interface ConnectionInfo {
  status: ConnectionStatus;
  type: ConnectionType;
  isConnected: boolean;
  isExpensive: boolean; // Conexión de datos móviles (cara)
}

/**
 * Callbacks de cambios de conexión
 */
type ConnectionListener = (info: ConnectionInfo) => void;

/**
 * Servicio central de conexión
 */
class ConnectionService {
  private listeners: Set<ConnectionListener> = new Set();
  private currentInfo: ConnectionInfo = {
    status: ConnectionStatus.CHECKING,
    type: ConnectionType.UNKNOWN,
    isConnected: false,
    isExpensive: false
  };
  
  /**
   * Suscribirse a cambios de conexión
   */
  subscribe(callback: ConnectionListener): () => void {
    this.listeners.add(callback);
    
    // Retornar función unsubscribe
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  /**
   * Notificar a todos los listeners
   */
  private notifyListeners(info: ConnectionInfo): void {
    this.currentInfo = info;
    this.listeners.forEach(listener => {
      try {
        listener(info);
      } catch (error) {
        console.error('[ConnectionService] Error en listener:', error);
      }
    });
  }
  
  /**
   * Obtener información actual
   */
  getCurrentInfo(): ConnectionInfo {
    return { ...this.currentInfo };
  }
  
  /**
   * Verificar si hay conexión
   */
  isConnected(): boolean {
    return this.currentInfo.isConnected;
  }
  
  /**
   * Verificar si es conexión móvil (cara)
   */
  isExpensiveConnection(): boolean {
    return this.currentInfo.isExpensive;
  }
  
  /**
   * Obtener tipo de conexión actual
   */
  getConnectionType(): ConnectionType {
    return this.currentInfo.type;
  }
  
  /**
   * Simular detección de conexión (para desarrollo/pruebas)
   */
  simulateConnection(type: ConnectionType, connected: boolean): void {
    const info: ConnectionInfo = {
      status: connected ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED,
      type,
      isConnected: connected,
      isExpensive: type === ConnectionType.CELLULAR
    };
    
    console.log('[ConnectionService] Simulando conexión:', info);
    this.notifyListeners(info);
  }
  
  /**
   * Inicializar el servicio (llamar una sola vez al startup)
   */
  initialize(): void {
    // Simular conexión inicial (en desarrollo)
    // En producción, esto usaría NetInfo de react-native
    this.simulateConnection(ConnectionType.WIFI, true);
  }
}

/**
 * Instancia singleton
 */
export const connectionService = new ConnectionService();

/**
 * Hook de React para usar el servicio
 */
export function useNetworkConnection(): ConnectionInfo & { isSlowConnection: boolean } {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(
    connectionService.getCurrentInfo()
  );
  
  useEffect(() => {
    // Suscribirse a cambios
    const unsubscribe = connectionService.subscribe(setConnectionInfo);
    
    // Limpiar suscripción
    return unsubscribe;
  }, []);
  
  return {
    ...connectionInfo,
    // Considerar lento si es cellular o desconectado
    isSlowConnection: connectionInfo.type === ConnectionType.CELLULAR || 
                      connectionInfo.status === ConnectionStatus.DISCONNECTED
  };
}

/**
 * Hook para monitorear cambios de tipo de conexión
 */
export function useConnectionTypeChange(
  callback: (type: ConnectionType) => void
): void {
  useEffect(() => {
    const unsubscribe = connectionService.subscribe((info) => {
      callback(info.type);
    });
    
    return unsubscribe;
  }, [callback]);
}

/**
 * Hook para monitorear estado de conexión
 */
export function useIsConnected(): boolean {
  const [isConnected, setIsConnected] = useState(connectionService.isConnected());
  
  useEffect(() => {
    const unsubscribe = connectionService.subscribe((info) => {
      setIsConnected(info.isConnected);
    });
    
    return unsubscribe;
  }, []);
  
  return isConnected;
}

/**
 * Configuración recomendada según tipo de conexión
 */
export function getRecommendedSettings(connectionType: ConnectionType) {
  switch (connectionType) {
    case ConnectionType.WIFI:
      return {
        quality: 'high',
        imageResolution: 'full',
        autoRefresh: true,
        autoSync: true,
        cacheDuration: 5 * 60 * 1000 // 5 minutos
      };
    
    case ConnectionType.CELLULAR:
      return {
        quality: 'medium',
        imageResolution: 'compressed',
        autoRefresh: false,
        autoSync: false,
        cacheDuration: 15 * 60 * 1000 // 15 minutos
      };
    
    default:
      return {
        quality: 'low',
        imageResolution: 'minimal',
        autoRefresh: false,
        autoSync: false,
        cacheDuration: 30 * 60 * 1000 // 30 minutos
      };
  }
}

export default connectionService;
