import { useRef, useEffect } from 'react';

/**
 * Custom hook for getting the previous value of a prop or state.
 * @param value The current value.
 * @returns The value from the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
  // FIX: Explicitly provide an initial value to `useRef` to address the "Expected 1 arguments, but got 0" error.
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}
