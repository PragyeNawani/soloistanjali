'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function WorkshopForm({ workshop, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: workshop?.title || '',
    description: workshop?.description || '',
    instructor: workshop?.instructor || '',
    date: workshop?.date ? new Date(workshop.date).toISOString().slice(0, 16) : '',
    duration: workshop?.duration || 120,
    price: workshop?.price || 0,
    maxParticipants: workshop?.max_participants || 30,
    workshopLink: workshop?.workshop_link || '',
    emailSubject: workshop?.email_subject || 'Workshop Registration Confirmation',
    emailMessage: workshop?.email_message || '',
  });
  const [loading, setLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 sm:p-6">
      <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-lg shadow-2xl border border-blue-800/50 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-900/95 to-gray-900/95 backdrop-blur-sm rounded-t-lg px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-blue-800/50 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-white">
            {workshop ? 'Edit Workshop' : 'Add New Workshop'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition p-1 hover:bg-blue-900/50 rounded"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form - Scrollable middle section */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Title and Instructor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    Workshop Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-blue-800/50 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter workshop title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    Instructor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-blue-800/50 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter instructor name"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-blue-800/50 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Enter workshop description"
                />
              </div>

              {/* Date, Duration, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-blue-800/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    Duration (min) *
                  </label>
                  <input
                    type="number"
                    required
                    min="30"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-blue-800/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="120"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-blue-800/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Max Participants and Workshop Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    Max Participants *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-blue-800/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    Workshop Link *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.workshopLink}
                    onChange={(e) => setFormData({ ...formData, workshopLink: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-blue-800/50 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              </div>

              {/* Email Configuration Section */}
              <div className="border-t border-blue-800/50 pt-4 sm:pt-6 mt-4 sm:mt-6">
                <h3 className="text-lg sm:text-xl font-serif text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-blue-400">📧</span>
                  Email Configuration
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emailSubject}
                      onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-blue-800/50 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Workshop Registration Confirmation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">
                      Email Message *
                    </label>
                    <textarea
                      required
                      value={formData.emailMessage}
                      onChange={(e) => setFormData({ ...formData, emailMessage: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-blue-800/50 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="6"
                      placeholder="Custom message to be included in the confirmation email..."
                    />
                    <p className="text-xs sm:text-sm text-blue-400 mt-2 bg-blue-950/30 p-2 sm:p-3 rounded border border-blue-800/30">
                      <strong>Available variables:</strong> {'{{userName}}'}, {'{{workshopTitle}}'}, {'{{date}}'}, {'{{time}}'}, {'{{link}}'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed at bottom, inside form */}
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-900/95 to-gray-900/95 backdrop-blur-sm rounded-b-lg px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t border-blue-800/50 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500 text-sm sm:text-base"
            >
              {loading ? 'Saving...' : workshop ? 'Update Workshop' : 'Create Workshop'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded font-medium hover:bg-gray-600 transition disabled:opacity-50 border border-gray-600 text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}