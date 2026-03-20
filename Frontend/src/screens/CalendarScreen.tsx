import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../api/client';
import { colors } from '../constants/colors';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const STATUS_COLORS: Record<string, string> = {
  Pending: colors.pending,
  InProgress: colors.inProgress,
  Completed: colors.completed,
};

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  InProgress: 'En Progreso',
  Completed: 'Completada',
};

/** Devuelve 'YYYY-MM-DD' en hora local */
const toDateKey = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDateKey = (key: string): string => {
  const [y, m, d] = key.split('-').map(Number);
  return `${d} de ${MONTH_NAMES[m - 1]} ${y}`;
};

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  createdAt: string;
  completedAt?: string;
}

export default function CalendarScreen({ navigation }: any) {
  const today = new Date();
  // Iniciar en febrero 2026 donde comienzan las tareas
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(1); // 0-indexed: 1 = Febrero
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch ALL tasks (sin paginación limitante) ---
  const fetchAllTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/tasks', {
        params: { pageSize: 50 },
      });
      if (res.data && Array.isArray(res.data.items)) {
        setTasks(res.data.items);
      } else {
        setError('La respuesta del servidor no es válida');
        setTasks([]);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      if (err.response?.status === 401) {
        setError('No autorizado. Verifica la API Key.');
      } else if (err.message === 'Network Error') {
        setError('Error de red. Verifica tu conexión.');
      } else {
        setError('Error al cargar las tareas.');
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh al entrar en la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchAllTasks();
    }, [fetchAllTasks]),
  );

  // --- Agrupar tareas por fecha (clave = 'YYYY-MM-DD') ---
  const tasksByDate = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    tasks.forEach((t) => {
      const key = toDateKey(t.createdAt);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  // --- Contar status por fecha ---
  const statusByDate = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    tasks.forEach((t) => {
      const key = toDateKey(t.createdAt);
      if (!key) return;
      if (!map[key]) map[key] = new Set();
      map[key].add(t.status);
    });
    return map;
  }, [tasks]);

  // --- Calendar grid helpers ---
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const todayKey = toDateKey(today.toISOString());

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  // Tareas del día seleccionado
  const selectedTasks = selectedDate ? tasksByDate[selectedDate] ?? [] : [];

  // --- Contadores de estado global ---
  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, InProgress: 0, Completed: 0 };
    tasks.forEach((t) => {
      if (t.status in counts) counts[t.status as keyof typeof counts]++;
    });
    return counts;
  }, [tasks]);

  // --- Render ---
  const renderCalendarGrid = () => {
    const cells: React.ReactNode[] = [];

    // Espacios vacíos antes del primer día
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const m = String(currentMonth + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      const dateKey = `${currentYear}-${m}-${d}`;
      const isToday = dateKey === todayKey;
      const isSelected = dateKey === selectedDate;
      const statuses = statusByDate[dateKey];

      cells.push(
        <TouchableOpacity
          key={dateKey}
          style={[
            styles.dayCell,
            isToday && styles.todayCell,
            isSelected && styles.selectedCell,
          ]}
          onPress={() => setSelectedDate(dateKey)}
          activeOpacity={0.6}
        >
          <Text
            style={[
              styles.dayText,
              isToday && styles.todayText,
              isSelected && styles.selectedText,
            ]}
          >
            {day}
          </Text>
          {statuses && (
            <View style={styles.dotsRow}>
              {Array.from(statuses).map((s) => (
                <View
                  key={s}
                  style={[styles.dot, { backgroundColor: STATUS_COLORS[s] || colors.textSecondary }]}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>,
      );
    }

    return cells;
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando calendario...</Text>
      </View>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <EmptyState title="Error" message={error} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendario</Text>
        <Text style={styles.subtitle}>
          {tasks.length} tarea{tasks.length !== 1 ? 's' : ''} registrada{tasks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Resumen de estados */}
      <View style={styles.summaryRow}>
        {(['Pending', 'InProgress', 'Completed'] as const).map((s) => (
          <View key={s} style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: STATUS_COLORS[s] }]} />
            <Text style={styles.summaryLabel}>{STATUS_LABELS[s]}</Text>
            <Text style={styles.summaryCount}>{statusCounts[s]}</Text>
          </View>
        ))}
      </View>

      {/* Navegación del mes */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Encabezados de día */}
      <View style={styles.weekHeader}>
        {DAYS_OF_WEEK.map((d) => (
          <Text key={d} style={styles.weekDayText}>
            {d}
          </Text>
        ))}
      </View>

      {/* Grid del calendario */}
      <View style={styles.calendarGrid}>{renderCalendarGrid()}</View>

      {/* Tareas del día seleccionado */}
      {selectedDate && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedDateTitle}>{formatDateKey(selectedDate)}</Text>
          {selectedTasks.length === 0 ? (
            <Text style={styles.noTasksText}>Sin tareas en este día</Text>
          ) : (
            selectedTasks.map((t) => (
              <TaskCard
                key={t.id}
                title={t.title}
                description={t.description}
                status={t.status}
                priority={t.priority}
                onPress={() => navigation.navigate('Detail', { id: t.id })}
              />
            ))
          )}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },

  // Header
  header: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
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
    marginTop: 4,
    fontWeight: '500',
  },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  summaryCount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  // Month Navigation
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.white,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 32,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  // Week header
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },

  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.white,
    paddingBottom: 8,
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 52,
  },
  todayCell: {
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: colors.primary + '25',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  todayText: {
    fontWeight: '700',
    color: colors.primary,
  },
  selectedText: {
    fontWeight: '700',
    color: colors.primary,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Selected date section
  selectedSection: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  selectedDateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  noTasksText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
