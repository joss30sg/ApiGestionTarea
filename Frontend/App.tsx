import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import { colors } from './src/constants/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 16,
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="Tasks"
          component={TaskListScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Detail"
          component={TaskDetailScreen}
          options={{
            title: 'Detalle de tarea',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}