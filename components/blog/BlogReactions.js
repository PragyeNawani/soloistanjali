'use client';

import React, { useState } from 'react';
import { Heart, ThumbsUp, Smile, Frown, Star } from 'lucide-react';

const reactionTypes = [
  { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-600' },
  { type: 'love', icon: Heart, label: 'Love', color: 'text-red-600' },
  { type: 'wow', icon: Star, label: 'Wow', color: 'text-yellow-600' },
  { type: 'happy', icon: Smile, label: 'Happy', color: 'text-green-600' },
  { type: 'sad', icon: Frown, label: 'Sad', color: 'text-gray-600' },
];

export default function BlogReactions({ slug, initialReactions, userReaction }) {
  const [reactions, setReactions] = useState(initialReactions || {});
  const [myReaction, setMyReaction] = useState(userReaction);
  const [loading, setLoading] = useState(false);

  const handleReact = async (reactionType) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/blogs/${slug}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.action === 'added') {
          setReactions({
            ...reactions,
            [reactionType]: (reactions[reactionType] || 0) + 1,
          });
          setMyReaction(reactionType);
        } else {
          setReactions({
            ...reactions,
            [reactionType]: Math.max(0, (reactions[reactionType] || 0) - 1),
          });
          setMyReaction(null);
        }
      }
    } catch (error) {
      console.error('Reaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {reactionTypes.map(({ type, icon: Icon, label, color }) => {
        const count = reactions[type] || 0;
        const isActive = myReaction === type;

        return (
          <button
            key={type}
            onClick={() => handleReact(type)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
              isActive
                ? `${color} bg-opacity-10 border-current scale-110`
                : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={label}
          >
            <Icon className={`w-5 h-5 ${isActive ? color : 'text-gray-600'}`} />
            {count > 0 && (
              <span className={`text-sm font-medium ${isActive ? color : 'text-gray-700'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}