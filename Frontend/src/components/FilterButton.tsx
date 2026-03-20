import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, isActive && styles.buttonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, isActive && styles.buttonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: colors.white,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  buttonTextActive: {
    color: colors.white,
  },
});
