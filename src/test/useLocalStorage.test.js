import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  it('returns initial value when nothing stored', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'hello'));
    expect(result.current[0]).toBe('hello');
  });

  it('persists value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []));
    act(() => {
      result.current[1]([1, 2, 3]);
    });
    expect(result.current[0]).toEqual([1, 2, 3]);
    expect(JSON.parse(localStorage.getItem('test-key'))).toEqual([1, 2, 3]);
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('pre-set', JSON.stringify({ foo: 'bar' }));
    const { result } = renderHook(() => useLocalStorage('pre-set', {}));
    expect(result.current[0]).toEqual({ foo: 'bar' });
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('bad-json', 'not-json{{{');
    const { result } = renderHook(() => useLocalStorage('bad-json', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('updates localStorage when value changes via setter function', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    act(() => {
      result.current[1](prev => prev + 1);
    });
    expect(result.current[0]).toBe(1);
    act(() => {
      result.current[1](prev => prev + 1);
    });
    expect(result.current[0]).toBe(2);
    expect(JSON.parse(localStorage.getItem('counter'))).toBe(2);
  });
});
