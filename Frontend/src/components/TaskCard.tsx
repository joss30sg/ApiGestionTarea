import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface TaskCardProps {
  title: string;
  description?: string;
  status: string;
  priority: string;
  onPress: () => void;
}

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

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  status,
  priority,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
      </View>

      {description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {description}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <View style={[styles.badge, { backgroundColor: getStatusColor(status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(status) }]}>
            {status}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getPriorityColor(priority) + '20' }]}>
          <Text style={[styles.badgeText, { color: getPriorityColor(priority) }]}>
            {priority}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
