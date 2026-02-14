import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../api/client';
import { colors } from '../constants/colors';
import { FilterButton } from '../components/FilterButton';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';

const STATES = [undefined, 'Pending', 'InProgress', 'Completed'] as const;
const PRIORITIES = [undefined, 'Low', 'Medium', 'High'] as const;

const STATE_LABELS: Record<string | undefined, string> = {
  undefined: 'Todos',
  'Pending': 'Pendiente',
  'InProgress': 'En progreso',
  'Completed': 'Completada',
};

const PRIORITY_LABELS: Record<string | undefined, string> = {
  undefined: 'Todas',
  'Low': 'Baja',
  'Medium': 'Media',
  'High': 'Alta',
};

export default function TaskListScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [stateFilter, setStateFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ CRÍTICO: Usar AbortController para manejar race conditions en filtros
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTasks = useCallback(async () => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('⚠️ [TaskList] Cancelando request anterior...');
    }
    
    // Crear nuevo AbortController para este request
    abortControllerRef.current = new AbortController();
    const currentAbortSignal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (stateFilter) params.state = stateFilter;
      if (priorityFilter) params.priority = priorityFilter;
      
      const res = await apiClient.get('/tasks', { 
        params,
        signal: currentAbortSignal // Pasar el signal al request
      });
      
      if (res.data && Array.isArray(res.data.items)) {
        setTasks(res.data.items);
      } else {
        setError('La respuesta del servidor no es válida');
        setTasks([]);
      }
    } catch (error: any) {
      // ✅ CRÍTICO: Ignorar AbortError (procede de cambio de filtro)
      if (error.name === 'AbortError') {
        console.log('ℹ️ [TaskList] Request cancelado por cambio de filtro');
        return; // No mostrar error al usuario
      }

      console.log('Error fetching tasks:', error);
      // Mostrar mensaje de error específico
      if (error.response?.status === 401) {
        setError('No autorizado. Verifica la configuración de la API Key.');
      } else if (error.response?.status === 429) {
        setError('Demasiadas solicitudes. Por favor, intenta más tarde.');
      } else if (error.response?.status === 500) {
        setError('Error en el servidor. Por favor, intenta más tarde.');
      } else if (error.code === 'ECONNABORTED') {
        setError('La solicitud tardó demasiado. Verifica tu conexión.');
      } else if (error.message === 'Network Error') {
        setError('Error de red. Verifica tu conexión a internet.');
      } else {
        setError('Error al cargar las tareas. Por favor, intenta de nuevo.');
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [stateFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Mis Tareas</Text>
      <Text style={styles.subtitle}>{tasks.length} tarea{tasks.length !== 1 ? 's' : ''}</Text>
    </View>
  );

  const renderFilters = () => (
    <>
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Estado</Text>
        <View style={styles.filterRow}>
          {STATES.map(s => (
            <FilterButton
              key={String(s)}
              label={STATE_LABELS[s] || 'Todos'}
              isActive={stateFilter === s}
              onPress={() => setStateFilter(s)}
            />
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Prioridad</Text>
        <View style={styles.filterRow}>
          {PRIORITIES.map(p => (
            <FilterButton
              key={String(p)}
              label={PRIORITY_LABELS[p] || 'Todas'}
              isActive={priorityFilter === p}
              onPress={() => setPriorityFilter(p)}
            />
          ))}
        </View>
      </View>
    </>
  );

  const renderContent = () => {
    // ✅ CRÍTICO: Mostrar error si existe
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="Error"
            message={error}
          />
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (tasks.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="Sin tareas"
            message="No hay tareas que coincidan con los filtros seleccionados"
          />
        </View>
      );
    }

    return (
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            title={item.title}
            description={item.description}
            status={item.status}
            priority={item.priority}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
          />
        )}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderFilters()}
          </>
        }
        renderItem={() => null}
        scrollEnabled={false}
      />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    backgroundColor: colors.white,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  filterSection: {
    paddingHorizontal: 18,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
});