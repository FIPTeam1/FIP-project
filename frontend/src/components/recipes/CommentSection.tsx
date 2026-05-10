'use client';

import { useEffect, useState } from 'react';
import { recipesApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Comment } from '@/lib/types';

interface CommentSectionProps {
  recipeId: string;
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CommentSection({ recipeId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await recipesApi.getComments(recipeId);
        setComments(res.data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [recipeId]);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await recipesApi.addComment(recipeId, content.trim());
      setComments((prev) => [res.data.data, ...prev]);
      setContent('');
    } catch {
      setError('Failed to post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-h1 font-semibold text-base-content">Comments</h2>

      {/* Post a comment (logged in only) */}
      {user ? (
        <div className="space-y-2">
          <textarea
            className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-body text-base-content placeholder:text-base-content/40 resize-none focus:outline-none focus:ring-2 focus:ring-[#FCAF3B] transition"
            rows={3}
            placeholder="Share your thoughts about this recipe..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={posting}
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex justify-end">
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="px-5 py-2 rounded-full text-sm font-medium text-white transition disabled:opacity-50"
              style={{ backgroundColor: '#5555FF' }}
            >
              {posting ? 'Posting…' : 'Post Comment'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-body text-base-content/50 italic">
          Log in to leave a comment.
        </p>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-base-300 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded bg-base-300" />
                <div className="h-3 w-full rounded bg-base-300" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-body text-base-content/40 italic">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <ul className="space-y-5">
          {comments.map((comment) => {
            const username = comment.user?.username ?? 'Unknown';
            const initials = getInitials(username);
            return (
              <li key={comment.id} className="flex gap-3">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: '#5555FF' }}
                >
                  {initials}
                </div>

                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-h3 font-medium text-base-content">
                      {username}
                    </span>
                    <span className="text-xs text-base-content/40">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-body text-base-content/80 mt-0.5 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
