import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import { colors } from './src/constants/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TasksStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={TaskDetailScreen}
        options={{ title: 'Detalle de tarea' }}
      />
    </Stack.Navigator>
  );
}

function CalendarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="CalendarMain"
        component={CalendarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={TaskDetailScreen}
        options={{ title: 'Detalle de tarea' }}
      />
    </Stack.Navigator>
  );
}

const TabIcon = ({ label, color }: { label: string; color: string }) => (
  <Text style={{ fontSize: 22 }}>{label}</Text>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            paddingBottom: 4,
            height: 56,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Tasks"
          component={TasksStack}
          options={{
            tabBarLabel: 'Tareas',
            tabBarIcon: ({ color }) => <TabIcon label="📋" color={color} />,
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarStack}
          options={{
            tabBarLabel: 'Calendario',
            tabBarIcon: ({ color }) => <TabIcon label="📅" color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}