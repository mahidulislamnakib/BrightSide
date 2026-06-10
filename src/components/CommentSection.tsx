import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, User, ThumbsUp } from 'lucide-react';
import { showToast } from './Toast';

interface Comment {
  id: number;
  name: string;
  content: string;
  likes: number;
  createdAt: Date;
}

interface CommentSectionProps {
  articleId: number;
}

// Client-side only comments (stored in localStorage)
function getComments(articleId: number): Comment[] {
  try {
    const key = `comments_${articleId}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveComment(articleId: number, comment: Comment) {
  try {
    const key = `comments_${articleId}`;
    const existing = getComments(articleId);
    existing.unshift(comment);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
  } catch { /* ignore */ }
}

function likeComment(articleId: number, commentId: number) {
  try {
    const key = `comments_${articleId}`;
    const comments = getComments(articleId);
    const updated = comments.map((c) =>
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    );
    localStorage.setItem(key, JSON.stringify(updated));
  } catch { /* ignore */ }
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(() => getComments(articleId));
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      name: name.trim(),
      content: content.trim(),
      likes: 0,
      createdAt: new Date(),
    };

    saveComment(articleId, comment);
    setComments((prev) => [comment, ...prev]);
    setContent('');
    showToast('Comment posted!');
  };

  const handleLike = (commentId: number) => {
    likeComment(articleId, commentId);
    setComments(getComments(articleId));
  };

  return (
    <div className="mt-12 pt-8 border-t border-borderlight">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} className="text-coral" />
        <h3 className="font-display text-xl text-charcoal">
          Community Discussion
          {comments.length > 0 && (
            <span className="font-body text-sm text-warmgrey ml-2">({comments.length})</span>
          )}
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-peach rounded-card p-5 mb-6">
        <div className="flex gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-coral-bright to-amber flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-cream" />
          </div>
          <div className="flex-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-lg border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral mb-2"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts on this story..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-borderlight bg-cream font-body text-sm focus:outline-none focus:border-coral resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!name.trim() || !content.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-button bg-gradient-to-b from-coral-bright to-amber text-cream font-body text-sm font-medium hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <Send size={14} />
            Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-peach/50 rounded-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center">
                <User size={12} className="text-cream" />
              </div>
              <div>
                <span className="font-body text-sm font-medium text-charcoal">{comment.name}</span>
                <span className="font-body text-xs text-warmgrey ml-2">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="font-body text-sm text-charcoal leading-relaxed pl-10">{comment.content}</p>
            <button
              onClick={() => handleLike(comment.id)}
              className="flex items-center gap-1.5 mt-2 pl-10 text-warmgrey hover:text-coral transition-colors font-body text-xs"
            >
              <ThumbsUp size={14} />
              {comment.likes > 0 ? comment.likes : 'Helpful'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
