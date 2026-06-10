import { Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/providers/trpc';
import { showToast } from './Toast';

interface BookmarkButtonProps {
  articleId: number;
  size?: number;
}

export default function BookmarkButton({ articleId, size = 18 }: BookmarkButtonProps) {
  const utils = trpc.useUtils();

  const { data: isBookmarked, isLoading } = trpc.bookmark.isBookmarked.useQuery(
    { articleId },
    { retry: false }
  );

  const toggle = trpc.bookmark.toggle.useMutation({
    onSuccess: (result) => {
      utils.bookmark.isBookmarked.setData({ articleId }, result.bookmarked);
      utils.bookmark.list.invalidate();
      utils.bookmark.count.invalidate();
      showToast(result.bookmarked ? 'Saved to bookmarks!' : 'Removed from bookmarks');
    },
    onError: () => {
      showToast('Please sign in to bookmark stories');
    },
  });

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate({ articleId });
      }}
      disabled={isLoading || toggle.isPending}
      className="relative p-1.5 transition-colors"
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <AnimatePresence mode="wait">
        {isBookmarked ? (
          <motion.div
            key="bookmarked"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.3 }}
          >
            <Bookmark size={size} className="text-coral fill-coral" />
          </motion.div>
        ) : (
          <motion.div
            key="not-bookmarked"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.3 }}
          >
            <Bookmark size={size} className="text-warmgrey hover:text-coral transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
