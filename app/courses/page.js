'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Unlock, Heart, Search, X } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Progressbar } from '@/components/ProgressBar';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState([]);
  const [wishlistCourseIds, setWishlistCourseIds] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  
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

      // Add image URLs directly from the stored image_url
      const coursesWithImages = (coursesData || []).map((course) => {
        let imageUrl = null;

        if (course.image_url) {
          const { data: { publicUrl } } = supabase.storage
            .from('courses')
            .getPublicUrl(course.image_url);
          imageUrl = publicUrl;
        }

        return { ...course, imageUrl };
      });

      setCourses(coursesWithImages);

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
      Drums: '🥁',
      Vocals: '🎤',
    };
    return emojiMap[instrument] || '🎵';
  };

  // Get unique instruments and levels from courses
  const instruments = ['all', ...new Set(courses.map(c => c.instrument).filter(Boolean))];
  const levels = ['all', ...new Set(courses.map(c => c.level).filter(Boolean))];

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesInstrument = selectedInstrument === 'all' || course.instrument === selectedInstrument;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesInstrument && matchesLevel;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedInstrument('all');
    setSelectedLevel('all');
  };

  const hasActiveFilters = searchQuery || selectedInstrument !== 'all' || selectedLevel !== 'all';

  if (loading) {
    return (
      <>
        <Progressbar />
      </>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className='bg-gradient-to-l from-gray-950 to-blue-950 pt-24 pb-10 mb-10'>
        <h1 className="text-5xl font-serif text-white text-center mb-4">
          Available Course PDFs
        </h1>
        <p className="text-blue-300 text-center max-w-2xl mx-auto">
          Explore our comprehensive collection of music courses. Purchase and
          download course materials instantly.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-blue-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white shadow-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Instrument Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrument
              </label>
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="w-full px-4 py-2 border border-blue-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white shadow-sm"
              >
                {instruments.map(instrument => (
                  <option key={instrument} value={instrument}>
                    {instrument === 'all' ? 'All Instruments' : instrument}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-blue-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white shadow-sm"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 mt-6 text-sm font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No courses found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const isPurchased = purchasedCourseIds.includes(course.id);
              const isInWishlist = wishlistCourseIds.includes(course.id);

              return (
                <div
                  key={course.id}
                  className="rounded-lg shadow-2xl overflow-hidden hover:shadow-blue-900/50 transition-all duration-300 relative"
                >
                  {/* Wishlist Button */}
                  <button
                    onClick={() => handleWishlistToggle(course.id)}
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all ${
                      isInWishlist
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-110'
                        : 'bg-[#11244A] text-gray-400 hover:text-red-400 hover:bg-red-950/30 border border-blue-800/50'
                    }`}
                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`}
                    />
                  </button>

                  {/* Course Image or Emoji */}
                  <div className="relative h-48 overflow-hidden border-b border-blue-900/30 flex">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-[#11244A] to-[#0B1C3E] flex items-center justify-center text-8xl ${
                        course.imageUrl ? 'hidden' : 'flex'
                      }`}
                    >
                      {getInstrumentEmoji(course.instrument)}
                    </div>
                  </div>

                  <div className="p-6 space-y-2 min-h-[400px] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-800 bg-blue-900/30 px-3 py-1 rounded border border-blue-800/50">
                        {course.level}
                      </span>
                      {isPurchased ? (
                        <Unlock className="text-green-600 w-5 h-5" />
                      ) : (
                        <Lock className="text-blue-700 w-5 h-5" />
                      )}
                    </div>
                    <h3 className="text-2xl font-serif text-black font-bold">
                      {course.title}
                    </h3>
                    <p className="text-blue-950 text-sm max-h-[200px] h-[200px] overflow-y-scroll">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-blue-900/30">
                      <span className="text-2xl font-bold text-primarytextlight">
                        ₹{course.price}
                      </span>
                      {isPurchased ? (
                        <button
                          onClick={() => router.push('/dashboard')}
                          className="bg-green-600 text-white px-6 py-2 text-sm font-medium rounded hover:bg-green-700 transition shadow-lg shadow-green-600/30"
                        >
                          View in Dashboard
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchase(course)}
                          className="bg-primarycontainer text-white px-6 py-2 text-sm font-medium rounded hover:bg-blue-900 transition"
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
        )}

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