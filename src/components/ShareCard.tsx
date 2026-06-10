import { forwardRef } from 'react';
import { Sunrise } from 'lucide-react';

export type CardRatio = '1:1' | '4:5' | '9:16' | '16:9';

interface ShareCardProps {
  title: string;
  summary: string;
  category: string;
  hopeScore: number;
  tier: string;
  region: string;
  ratio: CardRatio;
  theme?: 'warm' | 'dark' | 'light';
}

const RATIO_CLASSES: Record<CardRatio, string> = {
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '9:16': 'aspect-[9/16]',
  '16:9': 'aspect-video',
};

const THEME_STYLES = {
  warm: {
    bg: 'bg-gradient-to-br from-[#E8644B] via-[#C45C3E] to-[#9B4D36]',
    text: 'text-white',
    subtext: 'text-white/80',
    badge: 'bg-white/20 text-white border-white/30',
    scoreBg: 'bg-white/20',
    accent: 'text-[#F4D0C4]',
    line: 'bg-white/30',
  },
  dark: {
    bg: 'bg-gradient-to-br from-[#1A1814] via-[#2A2620] to-[#3A3630]',
    text: 'text-[#FFFBF5]',
    subtext: 'text-[#FFFBF5]/70',
    badge: 'bg-[#F4A261]/20 text-[#F4A261] border-[#F4A261]/30',
    scoreBg: 'bg-[#F4A261]/20',
    accent: 'text-[#F4A261]',
    line: 'bg-[#F4A261]/30',
  },
  light: {
    bg: 'bg-gradient-to-br from-[#FFF5EB] via-[#FFFBF5] to-[#F4D0C4]',
    text: 'text-[#1A1814]',
    subtext: 'text-[#1A1814]/70',
    badge: 'bg-[#E8644B]/10 text-[#C45C3E] border-[#E8644B]/20',
    scoreBg: 'bg-[#F4A261]/20',
    accent: 'text-[#C45C3E]',
    line: 'bg-[#E8644B]/20',
  },
};

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ title, summary, category, hopeScore, tier, region, ratio, theme = 'warm' }, ref) => {
    const styles = THEME_STYLES[theme];
    const scorePercent = Math.round(hopeScore * 100);
    const tierLabel = tier === 'gold' ? 'GOLD STANDARD' : tier === 'verified' ? 'VERIFIED' : 'CONSTRUCTIVE';

    // Truncate title based on ratio
    const maxTitleLength = ratio === '9:16' ? 80 : ratio === '16:9' ? 60 : 70;
    const displayTitle = title.length > maxTitleLength ? title.slice(0, maxTitleLength) + '...' : title;
    const maxSummaryLength = ratio === '9:16' ? 120 : ratio === '16:9' ? 80 : 100;
    const displaySummary = summary.length > maxSummaryLength ? summary.slice(0, maxSummaryLength) + '...' : summary;

    return (
      <div
        ref={ref}
        className={`${RATIO_CLASSES[ratio]} relative overflow-hidden flex flex-col ${styles.bg}`}
        style={{ width: ratio === '9:16' ? 360 : ratio === '16:9' ? 640 : 480 }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-6 md:p-8">
          {/* Top bar: Branding */}
          <div className="flex items-center justify-between mb-auto">
            <div className="flex items-center gap-2">
              <Sunrise size={ratio === '9:16' ? 24 : 18} className={styles.accent} />
              <span className={`font-display ${ratio === '9:16' ? 'text-xl' : 'text-lg'} ${styles.text}`}>
                BrightSide
              </span>
            </div>
            <span className={`caption-style ${styles.subtext} tracking-widest`}>
              GOOD NEWS
            </span>
          </div>

          {/* Middle: Article content */}
          <div className="my-auto py-4">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`caption-style px-3 py-1 rounded-pill border ${styles.badge}`}>
                {category.toUpperCase()}
              </span>
              <span className={`caption-style ${styles.subtext}`}>
                {region}
              </span>
            </div>

            {/* Title */}
            <h2 className={`font-display ${styles.text} leading-tight mb-3 ${
              ratio === '9:16' ? 'text-3xl' : ratio === '16:9' ? 'text-2xl' : 'text-[26px]'
            }`}>
              {displayTitle}
            </h2>

            {/* Summary */}
            <p className={`font-body ${styles.subtext} leading-relaxed ${
              ratio === '9:16' ? 'text-base' : 'text-sm'
            }`}>
              {displaySummary}
            </p>
          </div>

          {/* Bottom: Score + branding */}
          <div className="mt-auto">
            <div className={`w-full h-px ${styles.line} mb-4`} />
            <div className="flex items-center justify-between">
              {/* Hope Score */}
              <div className="flex items-center gap-3">
                <div className={`${styles.scoreBg} rounded-full flex items-center justify-center ${
                  ratio === '9:16' ? 'w-16 h-16' : 'w-14 h-14'
                }`}>
                  <div className="text-center">
                    <div className={`font-display ${ratio === '9:16' ? 'text-2xl' : 'text-xl'} ${styles.text} leading-none`}>
                      {scorePercent}
                    </div>
                    <div className={`text-[8px] font-body ${styles.subtext} uppercase tracking-wider`}>
                      Hope
                    </div>
                  </div>
                </div>
                <div>
                  <div className={`caption-style ${styles.accent}`}>{tierLabel}</div>
                  <div className={`text-[10px] font-body ${styles.subtext}`}>
                    Hope Score
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div className={`text-right ${styles.subtext}`}>
                <div className={`font-body text-[10px] ${ratio === '9:16' ? 'text-xs' : ''}`}>
                  Hope is a practice,
                </div>
                <div className={`font-body text-[10px] ${ratio === '9:16' ? 'text-xs' : ''}`}>
                  not a feeling.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;
