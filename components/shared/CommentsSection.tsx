'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { addComment } from '@/app/actions/comments';
import { Comment } from '@/types';
import { Send, UserCircle } from 'lucide-react';
import Link from 'next/link';

interface CommentsSectionProps {
  targetId: string;
  targetType: 'project' | 'idea';
  initialComments: any[];
}

export default function CommentsSection({ targetId, targetType, initialComments }: CommentsSectionProps) {
  const { userId } = useAuth();
  const [comments, setComments] = useState<any[]>(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;

    setLoading(true);
    try {
      const added = await addComment(targetId, targetType, newComment.trim());
      setComments([...comments, added]);
      setNewComment('');
    } catch (e) {
      console.error(e);
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="comments" style={{ marginTop: 'var(--space-12)' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-6)' }}>Comments ({comments.length})</h3>

      {/* Comment Input */}
      {userId ? (
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <UserCircle size={32} color="var(--text-3)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', gap: 'var(--space-3)' }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Leave a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ flex: 1 }}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={!newComment.trim() || loading}>
              <Send size={16} /> Post
            </button>
          </div>
        </form>
      ) : (
        <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', marginBottom: 'var(--space-8)', color: 'var(--text-3)' }}>
          <p style={{ marginBottom: 'var(--space-4)' }}>Sign in to leave a comment</p>
          <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
        </div>
      )}

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {comments.map((comment: any) => (
          <div key={comment.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
            <UserCircle size={32} color="var(--text-3)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                <Link href={`/profile/${comment.authorId}`} style={{ fontWeight: 600, color: 'var(--text-1)', textDecoration: 'none' }}>
                  {/* Since we don't store name in the JSON to avoid staleness, we ideally fetch it. For MVP, we just show user ID or 'User' */}
                  User
                </Link>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ color: 'var(--text-2)' }}>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
