import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface ProgressCounterProps {
  value: number;
  suffix?: string;
  label: string;
  className?: string;
  inverse?: boolean;
}

export default function ProgressCounter({ value, suffix = '', label, className = '', inverse = false }: ProgressCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const duration = 1500;
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(value * eased);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  const formatted = value >= 1000
    ? Math.round(displayValue).toLocaleString()
    : displayValue >= 1
      ? displayValue.toFixed(1)
      : displayValue.toFixed(2);

  return (
    <div ref={ref} className={`text-center ${className}`}>
      <div className={`font-display text-4xl md:text-5xl tracking-tight ${inverse ? 'score-pulse-inverse' : 'score-pulse'}`}>
        {formatted}{suffix}
      </div>
      <p className={`font-body text-sm mt-2 ${inverse ? 'text-cream/60' : 'text-warmgrey'}`}>
        {label}
      </p>
    </div>
  );
}
