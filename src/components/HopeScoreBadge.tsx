import { getTierColor, getTierLabel } from '@/lib/classifier';

interface HopeScoreBadgeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export default function HopeScoreBadge({ score, size = 48, showLabel = false }: HopeScoreBadgeProps) {
  const tierColor = getTierColor(score >= 0.80 ? 'gold' : score >= 0.65 ? 'verified' : 'constructive');
  const percentage = Math.round(score * 100);
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F0E6D8"
            strokeWidth={3}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tierColor}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.25, 1, 0.5, 1)' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-normal text-charcoal"
          style={{ fontSize: size * 0.33, letterSpacing: '-0.02em' }}
        >
          {percentage}
        </span>
      </div>
      {showLabel && (
        <span
          className="caption-style px-3 py-1 rounded-pill"
          style={{
            backgroundColor: tierColor + '18',
            color: tierColor,
          }}
        >
          {getTierLabel(score >= 0.80 ? 'gold' : score >= 0.65 ? 'verified' : 'constructive')}
        </span>
      )}
    </div>
  );
}
