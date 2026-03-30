/**
 * ✅ CRÍTICO: Parsing seguro de fechas
 * Previene crashes cuando la API devuelve fechas inválidas o formatos inesperados
 * 
 * Manejo robusto de tipos de fecha:
 * - ISO string: "2026-02-14T10:30:00Z"
 * - Timestamp: 1708007400000
 * - Fecha inválida: undefined, null, NaN
 */

/**
 * Parsea una cadena de fecha y retorna un formato readable
 * Si la fecha es inválida, retorna un mensaje por defecto
 */
export const parseDate = (dateString: string | Date | number | null | undefined): string => {
  try {
    // Caso: null o undefined
    if (!dateString) {
      return 'Fecha no disponible';
    }

    // Intentar crear una instancia de Date
    let date: Date;
    
    if (typeof dateString === 'string') {
      // ISO string o similares
      date = new Date(dateString);
    } else if (typeof dateString === 'number') {
      // Timestamp (milisegundos o segundos)
      date = new Date(dateString);
    } else if (dateString instanceof Date) {
      // Ya es Date
      date = dateString;
    } else {
      return 'Formato de fecha inválido';
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn(`⚠️ [Date Parser] Fecha inválida: ${dateString}`);
      return 'Fecha inválida';
    }

    // Retornar en formato local (es-ES para español)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error(`❌ [Date Parser] Error al parsear fecha:`, error);
    return 'Error en fecha';
  }
};

/**
 * Retorna solo la fecha sin la hora
 */
export const parseDateOnly = (dateString: string | Date | number | null | undefined): string => {
  try {
    if (!dateString) return 'Fecha no disponible';

    let date: Date;
    
    if (typeof dateString === 'string') {
      date = new Date(dateString);
    } else if (typeof dateString === 'number') {
      date = new Date(dateString);
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      return 'Formato de fecha inválido';
    }

    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error(`❌ [Date Parser] Error:`, error);
    return 'Error en fecha';
  }
};

/**
 * Retorna solo la hora
 */
export const parseTimeOnly = (dateString: string | Date | number | null | undefined): string => {
  try {
    if (!dateString) return '--:--';

    let date: Date;
    
    if (typeof dateString === 'string') {
      date = new Date(dateString);
    } else if (typeof dateString === 'number') {
      date = new Date(dateString);
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      return '--:--';
    }

    if (isNaN(date.getTime())) {
      return '--:--';
    }

    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error(`❌ [Date Parser] Error:`, error);
    return '--:--';
  }
};

/**
 * Compara dos fechas y retorna texto relativo (ej: "hace 2 horas")
 */
export const parseRelativeDate = (dateString: string | Date | number | null | undefined): string => {
  try {
    if (!dateString) return 'Fecha no disponible';

    let date: Date;
    
    if (typeof dateString === 'string') {
      date = new Date(dateString);
    } else if (typeof dateString === 'number') {
      date = new Date(dateString);
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      return 'Formato de fecha inválido';
    }

    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Fechas futuras: mostrar fecha formateada directamente
    if (diffMs < 0) return date.toLocaleDateString('es-ES');

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffSec < 60) return 'hace unos segundos';
    if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    if (diffHour < 24) return `hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
    if (diffDay < 7) return `hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;
    if (diffWeek < 4) return `hace ${diffWeek} ${diffWeek === 1 ? 'semana' : 'semanas'}`;
    if (diffMonth < 12) return `hace ${diffMonth} ${diffMonth === 1 ? 'mes' : 'meses'}`;
    
    return date.toLocaleDateString('es-ES');
  } catch (error) {
    console.error(`❌ [Date Parser] Error:`, error);
    return 'Fecha inválida';
  }
};
