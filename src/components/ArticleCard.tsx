import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Share2, ImageIcon } from 'lucide-react';
import type { Article } from '@/data/articles';
import { timeAgo, getTierColor, getTierLabel } from '@/lib/classifier';
import HopeScoreBadge from './HopeScoreBadge';

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
  onShare?: (article: Article) => void;
}

export default function ArticleCard({ article, compact = false, onShare }: ArticleCardProps) {
  const tierColor = getTierColor(article.tier);

  if (compact) {
    return (
      <Link to={`/article/${article.id}`}>
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          className="bg-peach rounded-card overflow-hidden group cursor-pointer"
        >
          <div className="aspect-video overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="p-4">
            <h3 className="font-display text-base text-charcoal leading-snug line-clamp-2">
              {article.title}
            </h3>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-peach rounded-card p-5 group hover:shadow-card-hover hover:-translate-y-[3px] transition-all duration-300 border border-transparent hover:border-coral-bright/15 cursor-pointer"
    >
      <Link to={`/article/${article.id}`} className="flex gap-5">
        <div className="w-[35%] min-w-[120px] aspect-[16/10] rounded-card overflow-hidden flex-shrink-0">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="caption-style px-3 py-0.5 rounded-pill bg-cream text-coral">
              {article.category.toUpperCase()}
            </span>
            <span className="caption-style text-warmgrey">
              {article.region.toUpperCase()}
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-coral" />
          </div>
          <h3 className="font-display text-xl text-charcoal leading-snug line-clamp-2 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-warmgrey leading-relaxed line-clamp-2 mb-3">
            {article.summary}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HopeScoreBadge score={article.hopeScore} size={32} />
              <span
                className="caption-style px-2 py-0.5 rounded-pill"
                style={{ backgroundColor: tierColor + '25', color: tierColor }}
              >
                {getTierLabel(article.tier)}
              </span>
              <span className="caption-style text-warmgrey">{timeAgo(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onShare && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(article); }}
                  className="p-1.5 text-warmgrey hover:text-coral transition-colors"
                  title="Generate share card"
                >
                  <ImageIcon size={18} />
                </button>
              )}
              <button className="p-1.5 text-warmgrey hover:text-coral transition-colors">
                <Bookmark size={18} />
              </button>
              <button className="p-1.5 text-warmgrey hover:text-coral transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
