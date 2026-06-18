import { useTheme } from './ThemeContext';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from './ThemeContext';

/**
 * Unit tests for ThemeContext
 */
describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('provides default theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBeDefined();
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  test('toggles theme correctly', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    const initialTheme = result.current.isDarkMode;

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDarkMode).toBe(!initialTheme);
  });

  test('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.toggleTheme();
    });

    const saved = localStorage.getItem('darkMode');
    expect(saved).toBeDefined();
  });
});
