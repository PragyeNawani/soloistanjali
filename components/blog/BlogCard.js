'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Eye, MessageCircle, Heart, ArrowRight } from 'lucide-react';

export default function BlogCard({ blog }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Link href={`/blog/${blog.slug}`}>
      <div className="rounded-lg hover:shadow-2xl overflow-hidden hover:shadow-blue-900/50 transition-all duration-300 cursor-pointer h-full flex flex-col border border-blue-900/30 bg-gray-50">
        {/* Featured Image */}
        {blog.featured_image ? (
          <div className="h-48 bg-gradient-to-br from-[#11244A] to-[#0B1C3E] overflow-hidden border-b border-blue-900/30">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-[#11244A] to-[#0B1C3E] flex items-center justify-center text-6xl border-b border-blue-900/30">
            📝
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          {/* Category Badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-blue-50 bg-blue-900 px-3 py-1 rounded-full uppercase border border-blue-800/50">
              {blog.category}
            </span>
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <Eye className="w-4 h-4" />
              {blog.views || 0}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-medium font-serif text-primarytext mb-3 line-clamp-2 transition">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-blue-800 text-sm line-clamp-3 mb-4 flex-1">
            {blog.excerpt || blog.content?.substring(0, 150) + '...'}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-blue-900/30">
            <div className="flex items-center gap-4 text-xs text-blue-700">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-700" />
                {formatDate(blog.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-blue-700" />
                {blog.total_reactions || 0}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4 text-blue-700" />
                {blog.total_comments || 0}
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-blue-700" />
          </div>
        </div>
      </div>
    </Link>
  );
}