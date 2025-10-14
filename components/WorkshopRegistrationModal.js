'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function WorkshopRegistrationModal({
  workshop,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    phone: '',
    additionalInfo: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-serif text-amber-900 mb-6">
          Workshop Registration
        </h2>

        <div className="bg-amber-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-serif text-amber-900 mb-3">
            {workshop.title}
          </h3>
          <div className="space-y-2 text-sm text-amber-700">
            <p>
              <strong>Instructor:</strong> {workshop.instructor}
            </p>
            <p>
              <strong>Date & Time:</strong> {formatDate(workshop.date)}
            </p>
            <p>
              <strong>Duration:</strong> {workshop.duration} minutes
            </p>
            <p className="text-2xl font-bold text-amber-900 mt-4">
              ₹{workshop.price}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter your phone number"
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Additional Information (Optional)
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) =>
                setFormData({ ...formData, additionalInfo: e.target.value })
              }
              className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Any questions or special requirements?"
              rows="4"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>📧 After Payment:</strong> You'll receive a confirmation
              email with the workshop link and joining instructions.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-900 text-white px-6 py-3 text-sm font-medium rounded hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 text-sm font-medium rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}