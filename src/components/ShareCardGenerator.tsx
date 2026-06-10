import { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Instagram, Twitter, Linkedin, Facebook, Smartphone } from 'lucide-react';
import ShareCard, { type CardRatio } from './ShareCard';
import { showToast } from './Toast';

interface PlatformPreset {
  name: string;
  ratio: CardRatio;
  icon: typeof Instagram;
  size: string;
  label: string;
}

const PLATFORMS: PlatformPreset[] = [
  { name: 'Instagram Post', ratio: '1:1', icon: Instagram, size: '1080 x 1080', label: 'Square' },
  { name: 'Instagram Story', ratio: '9:16', icon: Smartphone, size: '1080 x 1920', label: 'Story' },
  { name: 'Instagram Portrait', ratio: '4:5', icon: Instagram, size: '1080 x 1350', label: 'Portrait' },
  { name: 'Twitter / X', ratio: '16:9', icon: Twitter, size: '1200 x 675', label: 'Landscape' },
  { name: 'LinkedIn', ratio: '16:9', icon: Linkedin, size: '1200 x 627', label: 'Landscape' },
  { name: 'Facebook', ratio: '16:9', icon: Facebook, size: '1200 x 630', label: 'Landscape' },
];

type CardTheme = 'warm' | 'dark' | 'light';

const THEMES: { key: CardTheme; label: string; preview: string }[] = [
  { key: 'warm', label: 'Warm', preview: 'from-[#E8644B] to-[#9B4D36]' },
  { key: 'dark', label: 'Dark', preview: 'from-[#1A1814] to-[#3A3630]' },
  { key: 'light', label: 'Light', preview: 'from-[#FFF5EB] to-[#F4D0C4]' },
];

interface ShareCardGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    summary: string;
    category: string;
    hopeScore: number;
    tier: string;
    region: string;
  } | null;
}

export default function ShareCardGenerator({ isOpen, onClose, article }: ShareCardGeneratorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('warm');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const platform = PLATFORMS[selectedPlatform];

  const generateCard = useCallback(async () => {
    if (!cardRef.current || !article) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      });
      setGeneratedUrl(dataUrl);
      showToast('Card generated! Download or share below.');
    } catch (err) {
      console.error('Failed to generate card:', err);
      showToast('Failed to generate card. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [article]);

  const downloadCard = useCallback(() => {
    if (!generatedUrl) return;
    const link = document.createElement('a');
    link.download = `brightside-${article?.title?.slice(0, 30).replace(/\s+/g, '-')}-${platform.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = generatedUrl;
    link.click();
    showToast('Card downloaded!');
  }, [generatedUrl, article, platform]);

  const shareCard = useCallback(async () => {
    if (!generatedUrl) return;
    try {
      const response = await fetch(generatedUrl);
      const blob = await response.blob();
      const file = new File([blob], 'brightside-card.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: article?.title || 'BrightSide Story',
          text: `Check out this story on BrightSide: ${article?.title}`,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      }
    } catch {
      showToast('Sharing not supported on this device.');
    }
  }, [generatedUrl, article]);

  if (!isOpen || !article) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
          className="bg-cream rounded-card-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-borderlight">
            <div>
              <h2 className="font-display text-xl text-charcoal">Share This Story</h2>
              <p className="font-body text-xs text-warmgrey">Generate a card for social media</p>
            </div>
            <button onClick={onClose} className="p-2 text-warmgrey hover:text-coral transition-colors rounded-lg hover:bg-peach">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Left: Preview */}
            <div className="flex-1 bg-peach/30 flex items-center justify-center p-6 overflow-auto">
              <div className="transform scale-75 origin-center">
                <ShareCard
                  ref={cardRef}
                  title={article.title}
                  summary={article.summary}
                  category={article.category}
                  hopeScore={article.hopeScore}
                  tier={article.tier}
                  region={article.region}
                  ratio={platform.ratio}
                  theme={selectedTheme}
                />
              </div>
            </div>

            {/* Right: Controls */}
            <div className="w-full lg:w-80 border-l border-borderlight p-6 space-y-6 overflow-y-auto">
              {/* Platform Selector */}
              <div>
                <h3 className="caption-style text-warmgrey mb-3">PLATFORM</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((p, i) => (
                    <button
                      key={p.name}
                      onClick={() => { setSelectedPlatform(i); setGeneratedUrl(null); }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-card text-xs font-body transition-all duration-200 ${
                        selectedPlatform === i
                          ? 'bg-gradient-to-b from-coral-bright to-amber text-cream shadow-md'
                          : 'bg-peach text-charcoal hover:bg-peach/80'
                      }`}
                    >
                      <p.icon size={18} />
                      <span className="font-medium">{p.label}</span>
                      <span className={`text-[10px] ${selectedPlatform === i ? 'text-cream/70' : 'text-warmgrey'}`}>
                        {p.size}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div>
                <h3 className="caption-style text-warmgrey mb-3">THEME</h3>
                <div className="flex gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => { setSelectedTheme(t.key); setGeneratedUrl(null); }}
                      className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-card border-2 transition-all duration-200 ${
                        selectedTheme === t.key
                          ? 'border-coral bg-peach'
                          : 'border-transparent bg-peach/50 hover:bg-peach'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.preview}`} />
                      <span className="text-xs font-body text-charcoal">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-borderlight">
                {!generatedUrl ? (
                  <button
                    onClick={generateCard}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-sm font-medium hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Share2 size={16} />
                        Generate Card
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={downloadCard}
                      className="w-full py-3 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-sm font-medium hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download PNG
                    </button>
                    <button
                      onClick={shareCard}
                      className="w-full py-3 rounded-button border border-coral text-coral font-body text-sm font-medium hover:bg-coral hover:text-cream transition-all flex items-center justify-center gap-2"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                    <button
                      onClick={() => setGeneratedUrl(null)}
                      className="w-full py-2 text-xs font-body text-warmgrey hover:text-charcoal transition-colors"
                    >
                      Regenerate
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
