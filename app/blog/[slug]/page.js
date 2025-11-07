'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Eye,
  ArrowLeft,
  Download,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import BlogReactions from '@/components/blog/BlogReactions';
import BlogComments from '@/components/blog/BlogComments';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [reactions, setReactions] = useState({});
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug]);

  const fetchBlog = async () => {
    try {
      console.log('Fetching blog:', params.slug);
      
      const response = await fetch(`/api/blogs/${params.slug}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch blog: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Blog data:', data);

      if (data.blog) {
        setBlog(data.blog);
        
        // Process reactions
        const reactionsObj = {};
        if (data.reactions && Array.isArray(data.reactions)) {
          data.reactions.forEach((r) => {
            reactionsObj[r.reaction_type] = parseInt(r.count) || 0;
          });
        }
        setReactions(reactionsObj);
        
        setComments(data.comments || []);
      } else {
        throw new Error('Blog not found');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInstrumentEmoji = (category) => {
    const emojiMap = {
      events: '📅',
      courses: '📚',
      workshops: '🎪',
      news: '📰',
      tips: '💡',
      general: '📝',
    };
    return emojiMap[category] || '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-gray-950 to-blue-950 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <div className="text-blue-300 text-xl">Loading blog...</div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-gray-950 to-blue-950 py-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-serif text-white mb-4">Blog Not Found</h2>
          <p className="text-blue-300 mb-6">{error || 'The blog you\'re looking for doesn\'t exist or has been removed.'}</p>
          <button
            onClick={() => router.push('/blog')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 border border-blue-500"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-l from-gray-950 to-blue-950 py-16 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/blog')}
          className="flex items-center gap-2 text-blue-200 hover:text-blue-300 mb-8 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Blogs
        </button>

        {/* Blog Content */}
        <article className="bg-blue-50 rounded-lg shadow-2xl overflow-hidden border border-blue-900/30">
          {/* Featured Image */}
          {blog.featured_image ? (
            <div className="h-96 overflow-hidden border-b border-blue-900/30">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-96 bg-gradient-to-br from-[#11244A] to-[#0B1C3E] flex items-center justify-center border-b border-blue-900/30">
              <div className="text-9xl">{getInstrumentEmoji(blog.category)}</div>
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Category Badge */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-blue-100 bg-blue-900 px-4 py-2 rounded-full uppercase border border-blue-800/50">
                {blog.category}
              </span>
              <div className="flex items-center gap-4 text-sm text-blue-800">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {blog.views || 0} views
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-serif text-black mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-900 text-blue-100 px-3 py-1 rounded-full border border-blue-800/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Excerpt */}
            {blog.excerpt && (
              <div className="text-lg text-gray-800 italic mb-8 pb-8 border-b border-blue-900/30">
                {blog.excerpt}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-8">
              {blog.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                )
              ))}
            </div>

            {/* Attachments */}
            {blog.blog_attachments && blog.blog_attachments.length > 0 && (
              <div className="border-t border-blue-900/30 pt-8 mb-8">
                <h3 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-400" />
                  Attachments
                </h3>
                <div className="space-y-3">
                  {blog.blog_attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-[#11244A] rounded-lg hover:bg-blue-900/40 transition border border-blue-800/50"
                    >
                      {attachment.file_type === 'pdf' ? (
                        <FileText className="w-6 h-6 text-red-400" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-blue-400" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {attachment.file_name}
                        </p>
                        <p className="text-sm text-blue-300">
                          {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(2)} KB` : 'Download'}
                        </p>
                      </div>
                      <Download className="w-5 h-5 text-blue-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Reactions */}
            <div className="border-t border-blue-900/30 pt-8 mb-8">
              <h3 className="text-xl font-serif text-gray-800 mb-4">
                How do you feel about this?
              </h3>
              <BlogReactions
                slug={params.slug}
                initialReactions={reactions}
              />
            </div>

            {/* Comments */}
            <div className="border-t border-blue-900/30 pt-8">
              <BlogComments slug={params.slug} initialComments={comments} />
            </div>
          </div>
        </article>

        {/* Related Blogs CTA */}
        <div className="mt-8 bg-blue-100 rounded-lg p-6 text-center border border-blue-800/50">
          <h3 className="text-xl font-serif text-gray-800 mb-2">
            Enjoyed this article?
          </h3>
          <p className="text-gray-600 mb-4">
            Check out more blogs from CHORDS Studio
          </p>
          <button
            onClick={() => router.push('/blog')}
            className="bg-primarycontainer text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition "
          >
            Browse All Blogs
          </button>
        </div>
      </div>
    </div>
  );
}