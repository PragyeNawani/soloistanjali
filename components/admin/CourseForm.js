'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function CourseForm({ course, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    price: course?.price || 0,
    instrument: course?.instrument || 'Guitar',
    level: course?.level || 'Beginner',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing image if course exists
    if (course?.id) {
      loadCourseImage(course.id);
    }
  }, [course]);

  const loadCourseImage = async (courseId) => {
    try {
      const { data, error } = await supabase.storage
        .from('courses')
        .list('course-images', {
          search: `${courseId}.`
        });

      if (!error && data && data.length > 0) {
        const { data: { publicUrl } } = supabase.storage
          .from('courses')
          .getPublicUrl(`course-images/${data[0].name}`);

        setImagePreview(publicUrl);
      }
    } catch (error) {
      console.error('Error loading course image:', error);
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (courseId) => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${courseId}.${fileExt}`;
    const filePath = `course-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('courses')
      .upload(filePath, imageFile, {
        upsert: true // Overwrite if exists
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('courses')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pass data to parent component's onSubmit
      // The parent will handle the actual database operations
      await onSubmit({ 
        ...formData, 
        pdfFile, 
        imageFile 
      });

      alert('Course saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-serif text-amber-900">
            {course ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., Advanced Guitar Techniques"
            />
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
              rows="4"
              placeholder="Describe the course content..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Instrument *
              </label>
              <select
                value={formData.instrument}
                onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Guitar">Guitar</option>
                <option value="Piano">Piano</option>
                <option value="Cello">Cello</option>
                <option value="Violin">Violin</option>
                <option value="Drums">Drums</option>
                <option value="Vocals">Vocals</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Level *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Course Image Upload */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Course Image {!course && '*'}
            </label>
            {imagePreview ? (
              <div className="relative">
                <div className="border-2 border-amber-200 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Course preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-sm text-amber-600 mt-2">
                  {imageFile ? imageFile.name : 'Current course image'}
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-amber-200 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  required={!course}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-700">
                    Click to upload course image
                  </p>
                  <p className="text-sm text-amber-600 mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                  {course && (
                    <p className="text-sm text-amber-600 mt-1">
                      Leave empty to keep existing image
                    </p>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Course PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Course PDF {!course && '*'}
            </label>
            <div className="border-2 border-dashed border-amber-200 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="hidden"
                id="pdf-upload"
                required={!course}
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <FileText className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                <p className="text-amber-700">
                  {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                </p>
                <p className="text-sm text-amber-600 mt-1">
                  {course && 'Leave empty to keep existing PDF'}
                </p>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-900 text-white px-6 py-3 rounded font-medium hover:bg-amber-800 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
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