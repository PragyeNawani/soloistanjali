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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
        {/* Featured Image */}
        {blog.featured_image ? (
          <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-6xl">
            📝
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          {/* Category Badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase">
              {blog.category}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Eye className="w-4 h-4" />
              {blog.views || 0}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-serif text-amber-900 mb-3 line-clamp-2 hover:text-amber-700 transition">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-amber-700 text-sm line-clamp-3 mb-4 flex-1">
            {blog.excerpt || blog.content?.substring(0, 150) + '...'}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-100">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(blog.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {blog.total_reactions || 0}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {blog.total_comments || 0}
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-amber-900" />
          </div>
        </div>
      </div>
    </Link>
  );
}