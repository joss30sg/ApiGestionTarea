import React from 'react';

declare module '@testing-library/react-native' {
  export interface RenderOptions {
    [key: string]: any;
  }

  export interface RenderResult {
    [key: string]: any;
  }

  export function render(
    component: React.ReactElement,
    options?: RenderOptions
  ): RenderResult;

  export const screen: {
    getByText(text: string | RegExp): any;
    getByTestId(testID: string): any;
    getByPlaceholderText(text: string): any;
    queryByText(text: string | RegExp): any;
    queryByTestId(testID: string): any;
    findByText(text: string | RegExp): Promise<any>;
    findByTestId(testID: string): Promise<any>;
    [key: string]: any;
  };

  export function waitFor(
    callback: () => void | Promise<void>,
    options?: { timeout?: number }
  ): Promise<void>;

  export function fireEvent(
    element: any,
    eventName: string,
    eventData?: any
  ): any;

  export function act(callback: () => void | Promise<void>): Promise<void>;
}

declare module '@testing-library/jest-native' {
  export interface Matchers<R> {
    toBeVisible(): R;
    toHaveTextContent(text: string | RegExp): R;
    [key: string]: any;
  }
}
