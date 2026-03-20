import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../api/client';
import { colors } from '../constants/colors';
import { EmptyState } from '../components/EmptyState';
import { parseDate } from '../utils/dateParser'; // ✅ CRÍTICO: Usar parser seguro de fechas

/**
 * ✅ CRÍTICO: Validar que una cadena es un GUID válido
 * Previene requests con parámetros inválidos como "undefined" o strings aleatorios
 */
const isValidUUID = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return colors.pending;
    case 'InProgress':
      return colors.inProgress;
    case 'Completed':
      return colors.completed;
    default:
      return colors.textSecondary;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Low':
      return colors.lowPriority;
    case 'Medium':
      return colors.mediumPriority;
    case 'High':
      return colors.highPriority;
    default:
      return colors.textSecondary;
  }
};

export default function TaskDetailScreen({ route, navigation }: any) {
  // ✅ CRÍTICO: Validar parámetro de navegación
  const rawId = route?.params?.id;
  const id = isValidUUID(rawId) ? rawId : null;
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = async () => {
    if (!id) {
      setError('ID de tarea inválido. Por favor, vuelve atrás e intenta de nuevo.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/tasks/${id}`);
      if (res.data && typeof res.data === 'object') {
        setTask(res.data);
      } else {
        setError('La respuesta del servidor no es válida.');
      }
    } catch (error: any) {
      console.log('Error fetching task:', error);
      if (error.response?.status === 404) {
        setError('La tarea no existe o ha sido eliminada.');
      } else if (error.response?.status === 400) {
        setError('ID de tarea inválido.');
      } else if (error.response?.status === 401) {
        setError('No autorizado. Verifica la configuración de la API.');
      } else if (error.code === 'ECONNABORTED') {
        setError('La solicitud tardó demasiado. Intenta de nuevo.');
      } else {
        setError('Error al cargar la tarea. Intenta de nuevo.');
      }
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        fetchTask();
      }
    }, [id])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <EmptyState
            title="Error"
            message={error}
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver atrás</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <EmptyState
            title="Tarea no encontrada"
            message="No se pudo cargar la información de la tarea"
          />
        </View>
      </View>
    );
  }

  const createdDate = parseDate(task.createdAt);

  const completedDate = task.completedAt
    ? parseDate(task.completedAt)
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
      </View>

      {task.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado y Prioridad</Text>
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
            <Text style={[styles.badgeLabel, { color: getStatusColor(task.status) }]}>
              Estado
            </Text>
            <Text style={[styles.badgeValue, { color: getStatusColor(task.status) }]}>
              {task.status}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
            <Text style={[styles.badgeLabel, { color: getPriorityColor(task.priority) }]}>
              Prioridad
            </Text>
            <Text style={[styles.badgeValue, { color: getPriorityColor(task.priority) }]}>
              {task.priority}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Creada</Text>
          <Text style={styles.infoValue}>{createdDate}</Text>
        </View>
        {completedDate && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Completada</Text>
            <Text style={styles.infoValue}>{completedDate}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Volver a tareas</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
  },
  section: {
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontWeight: '400',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 14,
  },
  badge: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 10,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  badgeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
    minHeight: 50,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
});