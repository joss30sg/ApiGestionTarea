/**
 * Test Utilities para componentes React Native
 * Proporciona funciones de render con mocks preconfigurados
 */

import React from 'react';
import { render as rtlRender, RenderResult } from '@testing-library/react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

// Tipos para mocks
interface ApiMockImplementation {
  get?: jest.Mock;
  post?: jest.Mock;
  [key: string]: any;
}

interface NavigationMock {
  navigate?: jest.Mock;
  goBack?: jest.Mock;
  [key: string]: any;
}

// Reset de mocks antes de cada test
export const setupTest = () => {
  jest.clearAllMocks();
  
  // Configurar useFocusEffect para ejecutar callbacks inmediatamente
  (useFocusEffect as jest.Mock).mockImplementation((callback) => {
    callback();
  });
};

/**
 * Renderiza un componente con mocks de Navigation y Route
 */
export const renderWithNavigation = (
  component: React.ReactElement,
  {
    initialRouteParams = {},
    navigationMock = {},
  }: {
    initialRouteParams?: Record<string, any>;
    navigationMock?: NavigationMock;
  } = {}
): RenderResult => {
  // Configurar el mock de useRoute
  (useRoute as jest.Mock).mockReturnValue({
    key: 'test-key',
    name: 'TestScreen',
    params: initialRouteParams,
  });

  // Configurar el mock de useNavigation
  const defaultNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    isFocused: jest.fn(() => true),
  };

  (useNavigation as jest.Mock).mockReturnValue({
    ...defaultNavigation,
    ...navigationMock,
  });

  return rtlRender(component);
};

/**
 * Renderiza un componente con mocks del API client
 */
export const renderWithApi = (
  component: React.ReactElement,
  {
    apiMockImplementation = {},
  }: {
    apiMockImplementation?: ApiMockImplementation;
  } = {}
): RenderResult & { apiClient: any } => {
  // Importar y configurar el mock del API client
  const { apiClient } = require('../api/client');

  // Reset de mocks
  jest.clearAllMocks();

  // Configurar implementación personalizada si se proporciona
  if (apiMockImplementation.get) {
    apiClient.get.mockImplementation(apiMockImplementation.get);
  }
  if (apiMockImplementation.post) {
    apiClient.post.mockImplementation(apiMockImplementation.post);
  }

  const result = rtlRender(component) as any;
  result.apiClient = apiClient;

  return result;
};

/**
 * Renderiza un componente con todos los mocks configurados (Navigation + API)
 */
export const renderWithMocks = (
  component: React.ReactElement,
  {
    initialRouteParams = {},
    navigationMock = {},
    apiMockImplementation = {},
  }: {
    initialRouteParams?: Record<string, any>;
    navigationMock?: NavigationMock;
    apiMockImplementation?: ApiMockImplementation;
  } = {}
): RenderResult & { apiClient: any; navigation: any } => {
  // Configurar mocks de navegación
  (useRoute as jest.Mock).mockReturnValue({
    key: 'test-key',
    name: 'TestScreen',
    params: initialRouteParams,
  });

  const defaultNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    isFocused: jest.fn(() => true),
  };

  const mockNav = { ...defaultNavigation, ...navigationMock };
  (useNavigation as jest.Mock).mockReturnValue(mockNav);

  // Configurar mocks de API
  const { apiClient } = require('../api/client');
  jest.clearAllMocks();

  if (apiMockImplementation.get) {
    apiClient.get.mockImplementation(apiMockImplementation.get);
  }
  if (apiMockImplementation.post) {
    apiClient.post.mockImplementation(apiMockImplementation.post);
  }

  const result = rtlRender(component) as any;
  result.apiClient = apiClient;
  result.navigation = mockNav;

  return result;
};

/**
 * Utilidad para esperar a que se resuelvan promesas en tests
 */
export const waitForAsync = () => 
  new Promise(resolve => setTimeout(resolve, 100));
