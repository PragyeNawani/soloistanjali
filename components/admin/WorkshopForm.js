'use client';

import React, { useState } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-serif text-amber-900">
            {workshop ? 'Edit Workshop' : 'Add New Workshop'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Workshop Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Instructor Name *
              </label>
              <input
                type="text"
                required
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows="3"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                required
                min="30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Max Participants *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Workshop Link (Zoom/Meet) *
              </label>
              <input
                type="url"
                required
                value={formData.workshopLink}
                onChange={(e) => setFormData({ ...formData, workshopLink: e.target.value })}
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="https://zoom.us/j/..."
              />
            </div>
          </div>

          <div className="border-t border-amber-200 pt-6">
            <h3 className="text-xl font-serif text-amber-900 mb-4">
              Email Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Email Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.emailSubject}
                  onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                  className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Workshop Registration Confirmation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Email Message *
                </label>
                <textarea
                  required
                  value={formData.emailMessage}
                  onChange={(e) => setFormData({ ...formData, emailMessage: e.target.value })}
                  className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows="6"
                  placeholder="Custom message to be included in the confirmation email..."
                />
                <p className="text-sm text-amber-600 mt-2">
                  Available variables: {'{{userName}}'}, {'{{workshopTitle}}'}, {'{{date}}'}, {'{{time}}'}, {'{{link}}'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-900 text-white px-6 py-3 rounded font-medium hover:bg-amber-800 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : workshop ? 'Update Workshop' : 'Create Workshop'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded font-medium hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}