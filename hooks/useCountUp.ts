import { useState, useEffect, useRef } from 'react';
import { usePrevious } from './usePrevious';

const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Custom hook to animate a number counting up from a previous value.
 * @param end The target number to animate to.
 * @param duration The duration of the animation in ms.
 * @returns The current animated number.
 */
export const useCountUp = (end: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);
  const prevEnd = usePrevious(end) ?? 0;
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = prevEnd;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) {
          startTime = timestamp;
      }
      const progress = timestamp - startTime;
      const elapsed = Math.min(progress / duration, 1);
      const easedProgress = easeOutExpo(elapsed);
      
      const currentValue = startValue + (end - startValue) * easedProgress;
      setCount(currentValue);

      if (elapsed < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure it ends on the exact value
        setCount(end);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, prevEnd]);

  return Math.round(count);
};
