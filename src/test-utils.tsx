import { render, RenderOptions } from '@testing-library/react-native';
import { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * iPhone 15/16 logical metrics — the frame the design was authored against.
 * Screens read safe-area insets, so they need a provider with real values
 * rather than a stubbed hook.
 */
const METRICS = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

export function renderScreen(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => (
      <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
    ),
    ...options,
  });
}

export * from '@testing-library/react-native';
