import { useEffect, useRef, useState } from "react";

/**
 * Custom hook: Animates a number from 0 → targetValue when the element scrolls into view.
 * @param {number} targetValue - The final number to count up to.
 * @param {number} duration - Animation duration in ms (default 2000).
 * @returns {{ ref, displayValue }}
 */
export function useCountUp(targetValue, duration = 2000) {
  const ref = useRef(null);
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(eased * targetValue));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetValue, duration]);

  return { ref, displayValue };
}

/**
 * Custom hook: Returns true when element scrolls into view (for reveal animations).
 * @param {Object} options - IntersectionObserver options
 * @returns {{ ref, isVisible }}
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // only trigger once
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
