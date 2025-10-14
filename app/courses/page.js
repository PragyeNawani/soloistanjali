'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Unlock, Heart } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState([]);
  const [wishlistCourseIds, setWishlistCourseIds] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('id');

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Fetch purchased courses if logged in
      if (session?.user) {
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select('course_id')
          .eq('user_id', session.user.id)
          .eq('status', 'completed');

        if (purchasesError) throw purchasesError;
        setPurchasedCourseIds(purchasesData.map((p) => p.course_id) || []);

        // Fetch wishlist
        const wishlistResponse = await fetch('/api/wishlist');
        const wishlistData = await wishlistResponse.json();
        
        if (wishlistResponse.ok) {
          setWishlistCourseIds(
            wishlistData.wishlist.map((w) => w.course_id) || []
          );
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (course) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSelectedCourse(course);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    alert('Payment successful! Course unlocked. Check your dashboard.');
    router.push('/dashboard');
  };

  const handleWishlistToggle = async (courseId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const isInWishlist = wishlistCourseIds.includes(courseId);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        });

        if (response.ok) {
          setWishlistCourseIds(wishlistCourseIds.filter((id) => id !== courseId));
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        });

        if (response.ok) {
          setWishlistCourseIds([...wishlistCourseIds, courseId]);
        }
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      alert('Failed to update wishlist');
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
        <div className="text-amber-900 text-xl">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-serif text-amber-900 text-center mb-4">
          Available Courses
        </h1>
        <p className="text-amber-700 text-center mb-12 max-w-2xl mx-auto">
          Explore our comprehensive collection of music courses. Purchase and
          download course materials instantly.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const isPurchased = purchasedCourseIds.includes(course.id);
            const isInWishlist = wishlistCourseIds.includes(course.id);

            return (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition relative"
              >
                {/* Wishlist Button */}
                <button
                  onClick={() => handleWishlistToggle(course.id)}
                  className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all ${
                    isInWishlist
                      ? 'bg-red-500 text-white shadow-lg scale-110'
                      : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`}
                  />
                </button>

                <div className="bg-amber-100 h-48 flex items-center justify-center text-8xl">
                  {getInstrumentEmoji(course.instrument)}
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded">
                      {course.level}
                    </span>
                    {isPurchased ? (
                      <Unlock className="text-green-600 w-5 h-5" />
                    ) : (
                      <Lock className="text-amber-400 w-5 h-5" />
                    )}
                  </div>
                  <h3 className="text-2xl font-serif text-amber-900">
                    {course.title}
                  </h3>
                  <p className="text-amber-700 text-sm">{course.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                    <span className="text-2xl font-bold text-amber-900">
                      ₹{course.price}
                    </span>
                    {isPurchased ? (
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-green-600 text-white px-6 py-2 text-sm font-medium rounded hover:bg-green-700 transition"
                      >
                        View in Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(course)}
                        className="bg-amber-900 text-white px-6 py-2 text-sm font-medium rounded hover:bg-amber-800 transition"
                      >
                        Purchase
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Modal */}
        {showPayment && selectedCourse && (
          <PaymentModal
            course={selectedCourse}
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
}