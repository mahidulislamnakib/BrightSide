import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { CategoryInfo } from '@/data/articles';

interface CategoryCardProps {
  category: CategoryInfo;
  index: number;
}

export default function CategoryCard({ category, index }: CategoryCardProps) {
  const barWidth = `${category.avgHopeScore * 100}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 1, 0.5, 1] }}
    >
      <Link to={`/feed?category=${category.name}`}>
        <motion.div
          whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(232,100,75,0.08)' }}
          transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          className="bg-peach rounded-card p-7 border border-transparent hover:border-coral-bright/20 transition-all duration-300 cursor-pointer group"
        >
          <span className="text-[40px] leading-none block mb-3">{category.emoji}</span>
          <h3 className="font-display text-xl text-charcoal mb-1">{category.name}</h3>
          <p className="caption-style text-warmgrey mb-4">{category.articleCount} stories</p>
          <div className="w-full h-0.5 bg-borderlight rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gradient-shimmer"
              style={{
                width: barWidth,
                background: 'linear-gradient(90deg, #F4A261, #E8644B)',
              }}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
