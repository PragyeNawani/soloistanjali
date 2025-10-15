'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'events', label: 'Events' },
    { value: 'courses', label: 'Courses' },
    { value: 'workshops', label: 'Workshops' },
    { value: 'news', label: 'News' },
    { value: 'tips', label: 'Tips & Tricks' },
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [category, searchTerm, blogs]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      const data = await response.json();
      setBlogs(data.blogs || []);
      setFilteredBlogs(data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    let filtered = blogs;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter((blog) => blog.category === category);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBlogs(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#030A1C] via-[#051024] to-[#061831] py-16 flex items-center justify-center">
        <div className="text-blue-300 text-xl">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030A1C] via-[#051024] to-[#061831] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif text-white mb-4">
            Blog & Updates
          </h1>
          <p className="text-blue-300 text-lg max-w-2xl mx-auto">
            Stay updated with the latest news, events, and insights from CHORDS Studio
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-gradient-to-br from-[#0B1C3E] to-[#061831] rounded-lg shadow-2xl p-6 mb-8 border border-blue-900/30">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#11244A] border border-blue-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-400/60"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="pl-10 pr-8 py-3 bg-[#11244A] border border-blue-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#0B1C3E]">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(category !== 'all' || searchTerm) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-blue-300">Active filters:</span>
              {category !== 'all' && (
                <span className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-800/50">
                  {categories.find((c) => c.value === category)?.label}
                </span>
              )}
              {searchTerm && (
                <span className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-800/50">
                  "{searchTerm}"
                </span>
              )}
              <button
                onClick={() => {
                  setCategory('all');
                  setSearchTerm('');
                }}
                className="text-blue-400 text-sm hover:text-blue-300 hover:underline ml-2 transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-serif text-white mb-2">
              No blogs found
            </h3>
            <p className="text-blue-300">
              Try adjusting your filters or search term
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>

            {/* Results count */}
            <div className="text-center mt-8 text-blue-300">
              Showing {filteredBlogs.length} of {blogs.length} posts
            </div>
          </>
        )}
      </div>
    </div>
  );
}