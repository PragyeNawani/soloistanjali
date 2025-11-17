'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Shield,
  FileText,
  Eye,
  Mail,
  CheckCircle,
  Users,
  CircleIcon
} from 'lucide-react';
import SalesChart from '@/components/admin/SalesChart';
import CourseForm from '@/components/admin/CourseForm';
import WorkshopForm from '@/components/admin/WorkshopForm';
import WorkshopRegistrationsModal from '@/components/admin/WorkshopRegistrationsModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Progressbar} from '@/components/ProgressBar';

export default function AdminDashboard({ admin }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0 });
  const [salesBreakdown, setSalesBreakdown] = useState({ 
    total: 0, 
    courses: 0, 
    workshops: 0 
  });

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showWorkshopForm, setShowWorkshopForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);

  const [blogs, setBlogs] = useState([]);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const router = useRouter();

  const [notificationMessage, setNotificationMessage] = useState(null);

  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  const supabase = createClientComponentClient();

  const refreshWorkshopCount = async (workshopId) => {
    try {
      const regRes = await fetch(`/api/admin/workshops/${workshopId}/registrations`);
      if (regRes.ok) {
        const regData = await regRes.json();
        setWorkshops(prevWorkshops =>
          prevWorkshops.map(w =>
            w.id === workshopId
              ? { ...w, current_participants: regData.count || 0 }
              : w
          )
        );
      }
    } catch (error) {
      console.error(`Error refreshing count for workshop ${workshopId}:`, error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => {
        setNotificationMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get current date in YYYY-MM-DD format
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      const [coursesRes, salesRes] = await Promise.all([
        fetch('/api/admin/courses'),
        fetch('/api/admin/sales-analytics')
      ]);

      const coursesData = await coursesRes.json();
      const salesDataRes = await salesRes.json();

      // Fetch workshops directly from Supabase
      const { data: workshopsData, error: workshopsError } = await supabase
        .from('workshops')
        .select('*')
        .order('date', { ascending: true });

      if (workshopsError) {
        console.error('Error fetching workshops:', workshopsError);
      }

      // Add image URLs to courses
      const coursesWithImages = (coursesData.courses || []).map((course) => {
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

      // Fetch registration counts for all workshops
      const workshopsWithCounts = await Promise.all(
        (workshopsData || []).map(async (workshop) => {
          try {
            const regRes = await fetch(`/api/admin/workshops/${workshop.id}/registrations`);
            if (regRes.ok) {
              const regData = await regRes.json();
              return {
                ...workshop,
                current_participants: regData.count || 0
              };
            }
            return workshop;
          } catch (error) {
            console.error(`Error fetching count for workshop ${workshop.id}:`, error);
            return workshop;
          }
        })
      );
      setWorkshops(workshopsWithCounts);
      setSalesData(salesDataRes.chartData || []);
      setStats(salesDataRes.stats || { today: 0, week: 0, month: 0 });

      // Calculate sales breakdown
      const breakdown = {
        total: (salesDataRes.breakdown?.total || 0),
        courses: (salesDataRes.breakdown?.courses || 0),
        workshops: (salesDataRes.breakdown?.workshops || 0)
      };
      setSalesBreakdown(breakdown);

      const blogsRes = await fetch('/api/blogs?status=all');
      const blogsData = await blogsRes.json();
      setBlogs(blogsData.blogs || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate active workshops (future dates only)
  const getActiveWorkshopsCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    return workshops.filter(w => {
      const workshopDate = new Date(w.date);
      workshopDate.setHours(0, 0, 0, 0);
      return workshopDate >= today && w.status === 'upcoming';
    }).length;
  };

  const handleDeleteBlog = async (slug) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const response = await fetch(`/api/blogs/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Blog deleted successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleSaveCourse = async (courseData) => {
    try {
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('price', courseData.price);
      formData.append('instrument', courseData.instrument);
      formData.append('level', courseData.level);
      if (courseData.imageFile) {
        formData.append('image', courseData.imageFile);
      }
      if (courseData.pdfFile) {
        formData.append('pdf', courseData.pdfFile);
      }

      const url = editingCourse
        ? `/api/admin/courses/${editingCourse.id}`
        : '/api/admin/courses';

      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        alert(`Course ${editingCourse ? 'updated' : 'created'} successfully`);
        setShowCourseForm(false);
        setEditingCourse(null);
        fetchData();
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to save course'));
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Course deleted successfully');
        fetchData();
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting course');
    }
  };

  const handleSaveWorkshop = async (workshopData) => {
    try {
      // Ensure date is properly formatted
      let formattedDate;
      try {
        formattedDate = new Date(workshopData.date).toISOString();
      } catch (dateError) {
        alert('Invalid date format. Please check the date and try again.');
        return;
      }

      const url = editingWorkshop
        ? `/api/admin/workshops/${editingWorkshop.id}`
        : '/api/admin/workshops';

      const method = editingWorkshop ? 'PUT' : 'POST';

      // FIXED: Map to snake_case for database columns
      const payload = {
        title: workshopData.title,
        description: workshopData.description,
        instructor: workshopData.instructor,
        date: formattedDate,
        duration: parseInt(workshopData.duration, 10),
        price: parseFloat(workshopData.price),
        max_participants: parseInt(workshopData.maxParticipants, 10), // FIXED: snake_case
        workshop_link: workshopData.workshopLink, // FIXED: snake_case
        email_subject: workshopData.emailSubject || '', // FIXED: snake_case
        email_message: workshopData.emailMessage || '', // FIXED: snake_case
      };

      console.log('Sending payload:', payload); // Debug log

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        let message = `Workshop ${editingWorkshop ? 'updated' : 'created'} successfully!`;

        if (editingWorkshop && data.notificationsSent) {
          const workshopToUpdate = workshops.find(w => w.id === editingWorkshop.id);
          const participantCount = workshopToUpdate?.current_participants || 0;

          if (participantCount > 0) {
            message = {
              type: 'success',
              title: 'Workshop Updated Successfully!',
              description: `Email notifications sent to ${participantCount} registered participant${participantCount !== 1 ? 's' : ''}.`,
              changedFields: data.changedFields || []
            };
          }
        }

        setNotificationMessage(message);
        setShowWorkshopForm(false);
        setEditingWorkshop(null);
        fetchData();
      } else {
        console.error('API Error:', data);
        alert('Error: ' + (data.error || data.details || 'Failed to save workshop'));
      }
    } catch (error) {
      console.error('Error saving workshop:', error);
      alert('Error saving workshop: ' + error.message);
    }
  };

  const handleDeleteWorkshop = async (workshopId) => {
    if (!confirm('Are you sure you want to delete this workshop?')) return;

    try {
      const response = await fetch(`/api/admin/workshops/${workshopId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Workshop deleted successfully');
        fetchData();
      } else {
        alert('Failed to delete workshop');
      }
    } catch (error) {
      console.error('Error deleting workshop:', error);
      alert('Error deleting workshop');
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

  if (loading) {
    return (
      <>
        <Progressbar/>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-l from-gray-950 to-blue-950 py-16 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Notification Banner - Made responsive */}
        {notificationMessage && typeof notificationMessage === 'object' && (
          <div className="fixed top-4 right-2 sm:right-4 left-2 sm:left-auto z-50 max-w-md animate-slide-in">
            <div className="bg-gray-900 rounded-lg shadow-2xl border-l-4 border-green-500 p-3 sm:p-4 border border-blue-800">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                </div>
                <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-medium text-white flex items-center gap-2 flex-wrap">
                    <span className="break-words">{notificationMessage.title}</span>
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-300 break-words">
                    {notificationMessage.description}
                  </p>
                  {notificationMessage.changedFields && notificationMessage.changedFields.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400 break-words">
                      <span className="font-medium">Fields updated:</span> {notificationMessage.changedFields.join(', ')}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setNotificationMessage(null)}
                  className="ml-2 sm:ml-4 text-gray-500 hover:text-gray-300 flex-shrink-0 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header - Made responsive */}
        <div className="bg-gradient-to-r from-gray-950 to-blue-950 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white">
              Admin Dashboard
            </h1>
            <span className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit">
              <Shield className="w-3 h-3 mr-1" />
              ADMIN
            </span>
          </div>
          <p className="text-sm sm:text-base text-blue-300 break-all">Welcome, {admin.email}</p>
        </div>

        {/* Tabs - Made responsive with horizontal scroll on mobile */}
        <div className="bg-gray-950 rounded-lg shadow-lg mb-6 sm:mb-8 border border-blue-800/50 overflow-x-auto">
          <div className="flex border-b border-blue-800/30 min-w-max sm:min-w-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 min-w-[120px] px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition whitespace-nowrap ${activeTab === 'overview'
                ? 'border-b-2 border-blue-400 text-blue-200 bg-blue-950'
                : 'text-gray-300 hover:text-blue-300 bg-gray-950'
                }`}
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 min-w-[120px] px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition whitespace-nowrap ${activeTab === 'courses'
                ? 'border-b-2 border-blue-400 text-blue-200 bg-blue-950'
                : 'text-gray-300 hover:text-blue-300 bg-gray-950'
                }`}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Courses
            </button>
            <button
              onClick={() => setActiveTab('workshops')}
              className={`flex-1 min-w-[120px] px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition whitespace-nowrap ${activeTab === 'workshops'
                ? 'border-b-2 border-blue-400 text-blue-200 bg-blue-950'
                : 'text-gray-300 hover:text-blue-300 bg-gray-950'
                }`}
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Workshops
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`flex-1 min-w-[120px] px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition whitespace-nowrap ${activeTab === 'blogs'
                ? 'border-b-2 border-blue-400 text-blue-200 bg-blue-950'
                : 'text-gray-300 hover:text-blue-300 bg-gray-950'
                }`}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Blogs
            </button>
          </div>
        </div>

        {/* Overview Tab - Made responsive */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-r from-gray-950 to-blue-950 rounded-lg shadow-lg p-4 sm:p-6 border border-blue-800/50">
                <h3 className="text-xs sm:text-sm font-medium text-blue-100 mb-2">Today's Sales</h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-300">₹{stats.today.toLocaleString()}</p>
              </div>
              <div className="bg-blue-950 rounded-lg shadow-lg p-4 sm:p-6 border border-blue-800/50">
                <h3 className="text-xs sm:text-sm font-medium text-blue-100 mb-2">This Week</h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-300">₹{stats.week.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-l from-gray-950 to-blue-950 rounded-lg shadow-lg p-4 sm:p-6 border border-blue-800/50 sm:col-span-2 lg:col-span-1">
                <h3 className="text-xs sm:text-sm font-medium text-blue-100 mb-2">This Month</h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-300">₹{stats.month.toLocaleString()}</p>
              </div>
            </div>

            {/* Sales Breakdown Section - Made responsive */}
            <div className="bg-gradient-to-r from-gray-950 via-blue-950 to-gray-950 rounded-lg shadow-lg p-4 sm:p-6 border border-blue-800/50">
              <h3 className="text-lg sm:text-xl font-serif text-white mb-4 sm:mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                <span className="break-words">Sales Breakdown (All Time)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-800/30 to-blue-900/30 rounded-lg p-4 sm:p-6 border border-blue-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs sm:text-sm font-medium text-blue-300">Total Sales</h4>
                    <div className="bg-blue-600/30 p-2 rounded-lg">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1 break-all">
                    ₹{salesBreakdown.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-300">100% of revenue</p>
                </div>

                <div className="bg-gradient-to-br from-purple-800/30 to-purple-900/30 rounded-lg p-4 sm:p-6 border border-purple-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs sm:text-sm font-medium text-purple-300">Course Sales</h4>
                    <div className="bg-purple-600/30 p-2 rounded-lg">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1 break-all">
                    ₹{salesBreakdown.courses.toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-300">
                    {salesBreakdown.total > 0 
                      ? ((salesBreakdown.courses / salesBreakdown.total) * 100).toFixed(1) 
                      : 0}% of total
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-800/30 to-green-900/30 rounded-lg p-4 sm:p-6 border border-green-700/50 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs sm:text-sm font-medium text-green-300">Workshop Sales</h4>
                    <div className="bg-green-600/30 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1 break-all">
                    ₹{salesBreakdown.workshops.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-300">
                    {salesBreakdown.total > 0 
                      ? ((salesBreakdown.workshops / salesBreakdown.total) * 100).toFixed(1) 
                      : 0}% of total
                  </p>
                </div>
              </div>

              {/* Visual Progress Bar - Made responsive */}
              <div className="mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2">
                  <span className="text-xs sm:text-sm text-gray-400">Revenue Distribution</span>
                  <span className="text-xs sm:text-sm text-gray-400">Total: ₹{salesBreakdown.total.toLocaleString()}</span>
                </div>
                <div className="h-3 sm:h-4 bg-gray-800/50 rounded-full overflow-hidden flex border border-gray-700/50">
                  {salesBreakdown.total > 0 && (
                    <>
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                        style={{ width: `${(salesBreakdown.courses / salesBreakdown.total) * 100}%` }}
                      >
                        {((salesBreakdown.courses / salesBreakdown.total) * 100) > 15 && 
                          `${((salesBreakdown.courses / salesBreakdown.total) * 100).toFixed(0)}%`
                        }
                      </div>
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                        style={{ width: `${(salesBreakdown.workshops / salesBreakdown.total) * 100}%` }}
                      >
                        {((salesBreakdown.workshops / salesBreakdown.total) * 100) > 15 && 
                          `${((salesBreakdown.workshops / salesBreakdown.total) * 100).toFixed(0)}%`
                        }
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-start sm:gap-8 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-xs text-gray-400">Courses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-xs text-gray-400">Workshops</span>
                  </div>
                </div>
              </div>
            </div>

            <SalesChart data={salesData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-r from-gray-950 to-blue-950 rounded-lg shadow-lg p-4 sm:p-6 border border-blue-800/50">
                <h3 className="text-lg sm:text-xl font-serif text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-400">Total Courses:</span>
                    <span className="font-bold text-blue-300 text-sm sm:text-base">{courses.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-400">Total Workshops:</span>
                    <span className="font-bold text-blue-300 text-sm sm:text-base">{workshops.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-400">Active Workshops:</span>
                    <span className="font-bold text-green-400 text-sm sm:text-base">
                      {getActiveWorkshopsCount()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-l from-gray-950 to-blue-950 rounded-lg shadow-lg p-4 sm:p-6 border border-blue-800/50">
                <h3 className="text-lg sm:text-xl font-serif text-white mb-4">Recent Activity</h3>
                <p className="text-gray-400 text-xs sm:text-sm break-words">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab - Made responsive */}
        {activeTab === 'courses' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-serif text-white">Manage Courses</h2>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setShowCourseForm(true);
                }}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-medium hover:bg-blue-700 transition flex items-center justify-center border border-blue-500"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add New Course
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg overflow-hidden border border-blue-800/50 hover:border-blue-600/50 transition">
                  {/* Course Image or Emoji */}
                  <div className="relative h-32 sm:h-40 overflow-hidden border-b border-blue-700">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center text-4xl sm:text-5xl ${course.imageUrl ? 'hidden' : 'flex'
                        }`}
                    >
                      {getInstrumentEmoji(course.instrument)}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg sm:text-xl font-serif text-white mb-2 break-words">{course.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                    <div className="space-y-2 text-xs sm:text-sm mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-bold text-blue-300">₹{course.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Level:</span>
                        <span className="text-gray-300">{course.level}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Instrument:</span>
                        <span className="text-gray-300 truncate ml-2">{course.instrument}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setShowCourseForm(true);
                        }}
                        className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-blue-700 transition flex items-center justify-center border border-blue-500"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="flex-1 bg-red-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-red-700 transition flex items-center justify-center border border-red-500"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workshops Tab - Made responsive */}
        {activeTab === 'workshops' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-serif text-white">Manage Workshops</h2>
              <button
                onClick={() => {
                  setEditingWorkshop(null);
                  setShowWorkshopForm(true);
                }}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-medium hover:bg-blue-700 transition flex items-center justify-center border border-blue-500"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add New Workshop
              </button>
            </div>

            {/* Sub-tabs for Upcoming and Past - Made responsive */}
            <div className="bg-gradient-to-r from-blue-900/40 to-gray-900/40 rounded-lg shadow mb-6 border border-blue-800/50 overflow-x-auto">
              <div className="flex border-b border-blue-800/30 min-w-max sm:min-w-0">
                <button
                  onClick={() => setActiveTab('workshops')}
                  className="flex-1 min-w-[180px] px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 border-blue-400 text-blue-400 whitespace-nowrap"
                >
                  Upcoming Workshops
                  <span className="ml-2 bg-green-900/30 text-green-400 px-2 py-1 rounded-full text-xs border border-green-700/50">
                    {workshops.filter(w => new Date(w.date) >= new Date()).length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('workshops-past')}
                  className="flex-1 min-w-[180px] px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-400 hover:text-blue-300 whitespace-nowrap"
                >
                  Past Workshops
                  <span className="ml-2 bg-gray-900/30 text-gray-400 px-2 py-1 rounded-full text-xs border border-gray-700/50">
                    {workshops.filter(w => new Date(w.date) < new Date()).length}
                  </span>
                </button>
              </div>
            </div>

            {/* Upcoming Workshops - Made responsive */}
            <div className="space-y-4">
              {workshops
                .filter(w => new Date(w.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((workshop) => (
                  <div key={workshop.id} className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-4 sm:p-6 border border-blue-800/50">
                    <div className="flex flex-col">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-serif text-white break-words">{workshop.title}</h3>
                            <span className="px-2 sm:px-3 py-1 rounded text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/50 whitespace-nowrap">
                              Upcoming
                            </span>
                            <span className="px-2 sm:px-3 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-300 flex items-center gap-1 border border-blue-700/50 whitespace-nowrap">
                              <Users className="w-3 h-3" />
                              {workshop.current_participants || 0} registered
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                          <button
                            onClick={() => {
                              setSelectedWorkshop(workshop);
                              setShowRegistrationsModal(true);
                            }}
                            className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-green-700 transition flex items-center justify-center whitespace-nowrap border border-green-500"
                          >
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            View Registrations
                          </button>
                          <button
                            onClick={() => {
                              setEditingWorkshop(workshop);
                              setShowWorkshopForm(true);
                            }}
                            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-blue-700 transition flex items-center justify-center whitespace-nowrap border border-blue-500"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWorkshop(workshop.id)}
                            className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-red-700 transition flex items-center justify-center whitespace-nowrap border border-red-500"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base text-gray-300 mb-4 break-words">{workshop.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="space-y-2">
                          <p className="text-gray-500">Instructor: <span className="text-gray-300 font-medium break-words">{workshop.instructor}</span></p>
                          <p className="text-gray-500">Date: <span className="text-gray-300 font-medium break-words">{new Date(workshop.date).toLocaleString()}</span></p>
                          <p className="text-gray-500">Duration: <span className="text-gray-300 font-medium">{workshop.duration} minutes</span></p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-500">Price: <span className="text-gray-300 font-medium">₹{workshop.price}</span></p>
                          <p className="text-gray-500">Capacity: <span className="text-gray-300 font-medium">{workshop.current_participants || 0}/{workshop.max_participants}</span></p>
                          <p className="text-gray-500">Link: <a href={workshop.workshop_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">View Link</a></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {workshops.filter(w => new Date(w.date) >= new Date()).length === 0 && (
                <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-8 sm:p-12 text-center border border-blue-800/50">
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-blue-700" />
                  <h3 className="text-lg sm:text-xl font-serif text-white mb-2">No Upcoming Workshops</h3>
                  <p className="text-sm sm:text-base text-gray-400">Create a new workshop to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Past Workshops Tab - Made responsive */}
        {activeTab === 'workshops-past' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-serif text-white">Past Workshops</h2>
              <button
                onClick={() => setActiveTab('workshops')}
                className="w-full sm:w-auto bg-blue-900/30 text-blue-300 px-4 sm:px-6 py-2 sm:py-3 rounded font-medium hover:bg-blue-900/50 transition flex items-center justify-center border border-blue-800/50"
              >
                Back to Upcoming
              </button>
            </div>

            {/* Sub-tabs for Upcoming and Past - Made responsive */}
            <div className="bg-gradient-to-r from-blue-900/40 to-gray-900/40 rounded-lg shadow mb-6 border border-blue-800/50 overflow-x-auto">
              <div className="flex border-b border-blue-800/30 min-w-max sm:min-w-0">
                <button
                  onClick={() => setActiveTab('workshops')}
                  className="flex-1 min-w-[180px] px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-400 hover:text-blue-300 whitespace-nowrap"
                >
                  Upcoming Workshops
                  <span className="ml-2 bg-green-900/30 text-green-400 px-2 py-1 rounded-full text-xs border border-green-700/50">
                    {workshops.filter(w => new Date(w.date) >= new Date()).length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('workshops-past')}
                  className="flex-1 min-w-[180px] px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 border-blue-400 text-blue-400 whitespace-nowrap"
                >
                  Past Workshops
                  <span className="ml-2 bg-gray-900/30 text-gray-400 px-2 py-1 rounded-full text-xs border border-gray-700/50">
                    {workshops.filter(w => new Date(w.date) < new Date()).length}
                  </span>
                </button>
              </div>
            </div>

            {/* Past Workshops - Made responsive */}
            <div className="space-y-4">
              {workshops
                .filter(w => new Date(w.date) < new Date())
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((workshop) => (
                  <div key={workshop.id} className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-4 sm:p-6 border border-blue-800/50 opacity-90">
                    <div className="flex flex-col">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-serif text-white break-words">{workshop.title}</h3>
                            <span className="px-2 sm:px-3 py-1 rounded text-xs font-medium bg-gray-900/30 text-gray-400 border border-gray-700/50 whitespace-nowrap">
                              Completed
                            </span>
                            <span className="px-2 sm:px-3 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-300 flex items-center gap-1 border border-blue-700/50 whitespace-nowrap">
                              <Users className="w-3 h-3" />
                              {workshop.current_participants || 0} attended
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                          <button
                            onClick={() => {
                              setSelectedWorkshop(workshop);
                              setShowRegistrationsModal(true);
                            }}
                            className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-green-700 transition flex items-center justify-center whitespace-nowrap border border-green-500"
                          >
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            View Attendees
                          </button>
                          <button
                            onClick={() => handleDeleteWorkshop(workshop.id)}
                            className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-red-700 transition flex items-center justify-center whitespace-nowrap border border-red-500"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base text-gray-300 mb-4 break-words">{workshop.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="space-y-2">
                          <p className="text-gray-500">Instructor: <span className="text-gray-300 font-medium break-words">{workshop.instructor}</span></p>
                          <p className="text-gray-500">Date: <span className="text-gray-300 font-medium break-words">{new Date(workshop.date).toLocaleString()}</span></p>
                          <p className="text-gray-500">Duration: <span className="text-gray-300 font-medium">{workshop.duration} minutes</span></p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-500">Price: <span className="text-gray-300 font-medium">₹{workshop.price}</span></p>
                          <p className="text-gray-500">Attendance: <span className="text-gray-300 font-medium">{workshop.current_participants || 0}/{workshop.max_participants}</span></p>
                          <p className="text-gray-500">Revenue: <span className="text-green-400 font-medium">₹{(workshop.current_participants || 0) * workshop.price}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {workshops.filter(w => new Date(w.date) < new Date()).length === 0 && (
                <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-8 sm:p-12 text-center border border-blue-800/50">
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-blue-700" />
                  <h3 className="text-lg sm:text-xl font-serif text-white mb-2">No Past Workshops</h3>
                  <p className="text-sm sm:text-base text-gray-400">Past workshops will appear here after they're completed.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blogs Tab - Made responsive */}
        {activeTab === 'blogs' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-serif text-white">Manage Blogs</h2>
              <button
                onClick={() => router.push('/admin/blogs/new')}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-medium hover:bg-blue-700 transition flex items-center justify-center border border-blue-500"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create New Blog
              </button>
            </div>

            <div className="space-y-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-4 sm:p-6 border border-blue-800/50">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-serif text-white break-words">{blog.title}</h3>
                        <span className={`px-2 sm:px-3 py-1 rounded text-xs font-medium border whitespace-nowrap ${blog.status === 'published'
                          ? 'bg-green-900/30 text-green-400 border-green-700/50'
                          : 'bg-gray-900/30 text-gray-400 border-gray-700/50'
                          }`}>
                          {blog.status}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-400 mb-4 line-clamp-2 break-words">{blog.excerpt}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-500">Category: <span className="text-gray-300 font-medium break-words">{blog.category}</span></p>
                          <p className="text-gray-500">Views: <span className="text-gray-300 font-medium">{blog.views || 0}</span></p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500">Reactions: <span className="text-gray-300 font-medium">{blog.total_reactions || 0}</span></p>
                          <p className="text-gray-500">Comments: <span className="text-gray-300 font-medium">{blog.total_comments || 0}</span></p>
                        </div>
                        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                          <p className="text-gray-500">Created: <span className="text-gray-300 font-medium">{new Date(blog.created_at).toLocaleDateString()}</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 w-full lg:w-auto">
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-blue-700 transition flex items-center justify-center border border-blue-500 whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        View
                      </a>
                      <button
                        onClick={() => router.push(`/admin/blogs/${blog.slug}/edit`)}
                        className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-blue-700 transition flex items-center justify-center border border-blue-500 whitespace-nowrap"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.slug)}
                        className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-red-700 transition flex items-center justify-center border border-red-500 whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCourseForm && (
        <CourseForm
          course={editingCourse}
          onSubmit={handleSaveCourse}
          onClose={() => {
            setShowCourseForm(false);
            setEditingCourse(null);
          }}
        />
      )}

      {showWorkshopForm && (
        <WorkshopForm
          workshop={editingWorkshop}
          onSubmit={handleSaveWorkshop}
          onClose={() => {
            setShowWorkshopForm(false);
            setEditingWorkshop(null);
          }}
        />
      )}

      {showRegistrationsModal && selectedWorkshop && (
        <WorkshopRegistrationsModal
          workshop={selectedWorkshop}
          onClose={() => {
            refreshWorkshopCount(selectedWorkshop.id);
            setShowRegistrationsModal(false);
            setSelectedWorkshop(null);
          }}
        />
      )}
    </div>
  );
}