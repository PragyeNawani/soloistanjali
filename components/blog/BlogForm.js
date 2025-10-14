'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, FileText, Image as ImageIcon, Save, Eye } from 'lucide-react';

export default function BlogForm({ blog }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    content: blog?.content || '',
    excerpt: blog?.excerpt || '',
    category: blog?.category || 'general',
    tags: blog?.tags?.join(', ') || '',
    status: blog?.status || 'draft',
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(blog?.featured_image || null);
  const [attachments, setAttachments] = useState([]);

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'events', label: 'Events' },
    { value: 'courses', label: 'Courses' },
    { value: 'workshops', label: 'Workshops' },
    { value: 'news', label: 'News' },
    { value: 'tips', label: 'Tips & Tricks' },
  ];

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      setFeaturedImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // In the handleSubmit function, before sending:
  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)));
      formDataToSend.append('status', isDraft ? 'draft' : 'published');

      if (featuredImage) {
        formDataToSend.append('featuredImage', featuredImage);
      }

      attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      const url = blog
        ? `/api/blogs/${blog.slug.replace(/^-+/, '')}` // Remove leading dashes
        : '/api/blogs';
      const method = blog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Blog ${blog ? 'updated' : 'created'} successfully!`);
        router.push('/dashboard');
      } else {
        alert('Error: ' + (data.error || 'Failed to save blog'));
        console.error('Error details:', data);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-serif text-amber-900 mb-8">
            {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {/* Title */}
            {/* <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Blog Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter a compelling title..."
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Blog Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[a-zA-Z]/.test(value)) {
                    setFormData({ ...formData, title: value });
                  } else {
                    // Optional: Show error message or visual feedback
                    console.log("Title must start with a letter");
                  }
                }}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter a compelling title (must start with a letter)..."
              />
            </div>
            {/* Category and Tags */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="music, guitar, workshop..."
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Excerpt (Short Summary)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows="3"
                placeholder="Brief description of the blog post..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This will appear in blog listings and previews
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Blog Content *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                rows="20"
                placeholder="Write your blog content here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use line breaks to separate paragraphs
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Featured Image
              </label>

              {featuredImagePreview ? (
                <div className="relative mb-4">
                  <img
                    src={featuredImagePreview}
                    alt="Featured"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage(null);
                      setFeaturedImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-amber-200 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageChange}
                    className="hidden"
                    id="featured-image"
                  />
                  <label htmlFor="featured-image" className="cursor-pointer">
                    <ImageIcon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <p className="text-amber-700 mb-2">Click to upload featured image</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </label>
                </div>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Attachments (PDFs, Images)
              </label>

              {attachments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {file.type.includes('pdf') ? (
                          <FileText className="w-5 h-5 text-red-600" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-amber-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-2 border-dashed border-amber-200 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleAttachmentsChange}
                  className="hidden"
                  id="attachments"
                />
                <label htmlFor="attachments" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-700 mb-1">Click to upload files</p>
                  <p className="text-sm text-gray-500">
                    PDFs, images - up to 50MB each
                  </p>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-amber-200">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-800 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-5 h-5 mr-2" />
                {loading ? 'Publishing...' : 'Publish Blog'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Preview Section */}
          <div className="mt-12 pt-8 border-t border-amber-200">
            <h2 className="text-2xl font-serif text-amber-900 mb-4">Preview</h2>
            <div className="bg-amber-50 rounded-lg p-6">
              {featuredImagePreview && (
                <img
                  src={featuredImagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <div className="space-y-2">
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase">
                  {formData.category}
                </span>
                <h3 className="text-2xl font-serif text-amber-900">
                  {formData.title || 'Your blog title will appear here'}
                </h3>
                <p className="text-amber-700 text-sm">
                  {formData.excerpt || 'Your excerpt will appear here'}
                </p>
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.split(',').filter(t => t.trim()).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}