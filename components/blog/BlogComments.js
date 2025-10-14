'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Trash2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function BlogComments({ slug, initialComments }) {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (session) {
      setCurrentUser(session.user);
      setIsAdmin(session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/blogs/${slug}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      } else {
        if (response.status === 401) {
          if (confirm('You need to login to comment. Go to login page?')) {
            router.push('/login');
          }
        } else {
          setError(data.error || 'Failed to post comment');
        }
      }
    } catch (error) {
      console.error('Comment error:', error);
      setError('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeletingId(commentId);

    try {
      const response = await fetch(`/api/blogs/comments/${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      } else {
        alert(data.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  const canDeleteComment = (comment) => {
    if (!currentUser) return false;
    if (isAdmin) return true; // Admin can delete any comment
    return comment.user_id === currentUser.id; // User can delete own comments
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-serif text-amber-900 mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={
            currentUser
              ? 'Share your thoughts...'
              : 'Login to comment...'
          }
          className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          rows="4"
          disabled={loading || !currentUser}
        />

        {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}

        <div className="flex justify-between items-center mt-2">
          {!currentUser && (
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-amber-900 text-sm hover:underline"
            >
              Login to comment
            </button>
          )}
          <div className="flex-1"></div>
          <button
            type="submit"
            disabled={loading || !newComment.trim() || !currentUser}
            className="bg-amber-900 text-white px-6 py-2 rounded-lg hover:bg-amber-800 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-amber-50 rounded-lg p-4 border border-amber-100 relative group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-amber-900 flex items-center gap-1">
                      {comment.profiles?.name || 'Anonymous'}
                      {isAdmin && comment.user_id === currentUser?.id && (
                        <Shield className="w-4 h-4 text-red-600" title="Admin" />
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-amber-800 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>

                {/* Delete Button */}
                {canDeleteComment(comment) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-50"
                    title={isAdmin ? 'Delete comment (Admin)' : 'Delete your comment'}
                  >
                    {deletingId === comment.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}