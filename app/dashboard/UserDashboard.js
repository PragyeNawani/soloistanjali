'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Download, Lock, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Heart, ShoppingCart } from 'lucide-react';
export default function UserDashboard({ user }) {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [workshopRegistrations, setWorkshopRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch purchased courses
      const coursesResponse = await fetch('/api/courses/purchased');
      const coursesData = await coursesResponse.json();

      if (coursesResponse.ok) {
        setPurchasedCourses(coursesData.courses || []);
      }

      // Fetch workshop registrations
      const workshopResponse = await fetch('/api/workshops/my-registrations');
      const workshopData = await workshopResponse.json();

      if (workshopResponse.ok) {
        setWorkshopRegistrations(workshopData.registrations || []);
      }
      // Fetch wishlist
      const wishlistResponse = await fetch('/api/wishlist');
      const wishlistData = await wishlistResponse.json();

      if (wishlistResponse.ok) {
        setWishlistItems(wishlistData.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  {/* Add handleRemoveFromWishlist function */ }
  const handleRemoveFromWishlist = async (courseId) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        setWishlistItems(wishlistItems.filter((item) => item.course_id !== courseId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    }
  };
  const handleDownload = async (courseId, courseTitle) => {
    try {
      const response = await fetch(`/api/courses/download?courseId=${courseId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Download failed');
      }

      window.open(data.downloadUrl, '_blank');
    } catch (error) {
      alert('Download error: ' + error.message);
    }
  };

  const getInstrumentEmoji = (instrument) => {
    const emojiMap = {
      Guitar: '🎸',
      Piano: '🎹',
      Cello: '🎻',
      Violin: '🎻',
    };
    return emojiMap[instrument] || '🎵';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-16 flex items-center justify-center">
        <div className="text-amber-900 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <User className="w-12 h-12 text-amber-900 mr-4" />
              <div>
                <h1 className="text-3xl font-serif text-amber-900">
                  Welcome, {user?.user_metadata?.name || 'Student'}
                </h1>
                <p className="text-amber-700">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-serif text-amber-900 mb-8">
          Your Purchased Courses
        </h2>

        {purchasedCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center mb-12">
            <Lock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-serif text-amber-900 mb-4">
              No Courses Yet
            </h3>
            <p className="text-amber-700 mb-6">
              You haven't purchased any courses. Browse our collection to get
              started!
            </p>
            <Link
              href="/courses"
              className="inline-block bg-amber-900 text-white px-8 py-3 text-sm font-medium rounded hover:bg-amber-800 transition"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {purchasedCourses.map((purchase) => {
              const course = purchase.courses;
              return (
                <div
                  key={purchase.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 h-48 flex items-center justify-center text-8xl">
                    {getInstrumentEmoji(course.instrument)}
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded">
                        PURCHASED
                      </span>
                      <span className="text-xs text-amber-600">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-2xl font-serif text-amber-900">
                      {course.title}
                    </h3>
                    <p className="text-amber-700 text-sm">
                      {course.description}
                    </p>
                    <button
                      onClick={() => handleDownload(course.id, course.title)}
                      className="w-full bg-amber-900 text-white px-6 py-3 text-sm font-medium rounded hover:bg-amber-800 transition flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Add this section after purchased courses and before workshops */}
        {wishlistItems.length > 0 && (
          <>
            <h2 className="text-3xl font-serif text-amber-900 mb-8 mt-12 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              Your Wishlist
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {wishlistItems.map((item) => {
                const course = item.courses;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden relative"
                  >
                    <div className="bg-gradient-to-br from-pink-100 to-rose-100 h-48 flex items-center justify-center text-8xl">
                      {getInstrumentEmoji(course.instrument)}
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-pink-700 bg-pink-100 px-3 py-1 rounded">
                          WISHLIST
                        </span>
                        <span className="text-xs text-amber-600">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-serif text-amber-900">
                        {course.title}
                      </h3>
                      <p className="text-amber-700 text-sm">{course.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                        <span className="text-2xl font-bold text-amber-900">
                          ₹{course.price}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Navigate to courses page with this course
                            window.location.href = `/courses#course-${course.id}`;
                          }}
                          className="flex-1 bg-amber-900 text-white px-4 py-2 text-sm font-medium rounded hover:bg-amber-800 transition flex items-center justify-center"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Now
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(course.id)}
                          className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-red-700 transition"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {workshopRegistrations.length > 0 && (
          <>
            <h2 className="text-3xl font-serif text-amber-900 mb-8 mt-12">
              Your Registered Workshops
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {workshopRegistrations.map((registration) => {
                const workshop = registration.workshops;
                const workshopDate = new Date(workshop.date);
                const isPast = workshopDate < new Date();

                return (
                  <div
                    key={registration.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-48 flex items-center justify-center text-8xl">
                      🎼
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded">
                          {isPast ? 'COMPLETED' : 'REGISTERED'}
                        </span>
                        <span className="text-xs text-amber-600">
                          {new Date(
                            registration.registered_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-serif text-amber-900">
                        {workshop.title}
                      </h3>
                      <div className="space-y-2 text-sm text-amber-700">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {workshopDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>{workshop.instructor}</span>
                        </div>
                      </div>
                      {!isPast && workshop.workshop_link && (
                        <a
                          href={workshop.workshop_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-purple-600 text-white px-6 py-3 text-sm font-medium rounded hover:bg-purple-700 transition flex items-center justify-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join Workshop
                        </a>
                      )}
                      {isPast && (
                        <div className="w-full bg-gray-200 text-gray-600 px-6 py-3 text-sm font-medium rounded text-center">
                          Workshop Completed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-12 bg-amber-100 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-serif text-amber-900 mb-4">
            Want to Learn More?
          </h3>
          <p className="text-amber-700 mb-6">
            Explore our full collection of courses and workshops to expand your
            musical knowledge
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/courses"
              className="inline-block bg-amber-900 text-white px-8 py-3 text-sm font-medium rounded hover:bg-amber-800 transition"
            >
              Browse All Courses
            </Link>
            <Link
              href="/workshops"
              className="inline-block bg-purple-700 text-white px-8 py-3 text-sm font-medium rounded hover:bg-purple-600 transition"
            >
              View Workshops
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}