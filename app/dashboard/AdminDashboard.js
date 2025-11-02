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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification Banner */}
        {notificationMessage && typeof notificationMessage === 'object' && (
          <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
            <div className="bg-gray-900 rounded-lg shadow-2xl border-l-4 border-green-500 p-4 border border-blue-800">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    {notificationMessage.title}
                    <Mail className="h-4 w-4 text-green-500" />
                  </h3>
                  <p className="mt-1 text-sm text-gray-300">
                    {notificationMessage.description}
                  </p>
                  {notificationMessage.changedFields && notificationMessage.changedFields.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      <span className="font-medium">Fields updated:</span> {notificationMessage.changedFields.join(', ')}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setNotificationMessage(null)}
                  className="ml-4 text-gray-500 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-6 mb-8 border border-blue-800/50">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-serif text-white">
              Admin Dashboard
            </h1>
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              ADMIN
            </span>
          </div>
          <p className="text-blue-300">Welcome, {admin.email}</p>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-r from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg mb-8 border border-blue-800/50">
          <div className="flex border-b border-blue-800/30">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'overview'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-gray-400 hover:text-blue-300'
                }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'courses'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-gray-400 hover:text-blue-300'
                }`}
            >
              <BookOpen className="w-5 h-5 inline mr-2" />
              Courses
            </button>
            <button
              onClick={() => setActiveTab('workshops')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'workshops'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-gray-400 hover:text-blue-300'
                }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Workshops
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === 'blogs'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-gray-400 hover:text-blue-300'
                }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Blogs
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-6 border border-blue-800/50">
                <h3 className="text-sm font-medium text-blue-300 mb-2">Today's Sales</h3>
                <p className="text-3xl font-bold text-blue-400">₹{stats.today.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-6 border border-blue-800/50">
                <h3 className="text-sm font-medium text-blue-300 mb-2">This Week</h3>
                <p className="text-3xl font-bold text-blue-400">₹{stats.week.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-6 border border-blue-800/50">
                <h3 className="text-sm font-medium text-blue-300 mb-2">This Month</h3>
                <p className="text-3xl font-bold text-blue-400">₹{stats.month.toLocaleString()}</p>
              </div>
            </div>

            {/* Sales Breakdown Section */}
            <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-6 border border-blue-800/50">
              <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Sales Breakdown (All Time)
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-800/30 to-blue-900/30 rounded-lg p-6 border border-blue-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-blue-300">Total Sales</h4>
                    <div className="bg-blue-600/30 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    ₹{salesBreakdown.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-300">100% of revenue</p>
                </div>

                <div className="bg-gradient-to-br from-purple-800/30 to-purple-900/30 rounded-lg p-6 border border-purple-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-purple-300">Course Sales</h4>
                    <div className="bg-purple-600/30 p-2 rounded-lg">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    ₹{salesBreakdown.courses.toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-300">
                    {salesBreakdown.total > 0 
                      ? ((salesBreakdown.courses / salesBreakdown.total) * 100).toFixed(1) 
                      : 0}% of total
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-800/30 to-green-900/30 rounded-lg p-6 border border-green-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-green-300">Workshop Sales</h4>
                    <div className="bg-green-600/30 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    ₹{salesBreakdown.workshops.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-300">
                    {salesBreakdown.total > 0 
                      ? ((salesBreakdown.workshops / salesBreakdown.total) * 100).toFixed(1) 
                      : 0}% of total
                  </p>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Revenue Distribution</span>
                  <span className="text-sm text-gray-400">Total: ₹{salesBreakdown.total.toLocaleString()}</span>
                </div>
                <div className="h-4 bg-gray-800/50 rounded-full overflow-hidden flex border border-gray-700/50">
                  {salesBreakdown.total > 0 && (
                    <>
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                        style={{ width: `${(salesBreakdown.courses / salesBreakdown.total) * 100}%` }}
                      >
                        {((salesBreakdown.courses / salesBreakdown.total) * 100) > 10 && 
                          `${((salesBreakdown.courses / salesBreakdown.total) * 100).toFixed(0)}%`
                        }
                      </div>
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                        style={{ width: `${(salesBreakdown.workshops / salesBreakdown.total) * 100}%` }}
                      >
                        {((salesBreakdown.workshops / salesBreakdown.total) * 100) > 10 && 
                          `${((salesBreakdown.workshops / salesBreakdown.total) * 100).toFixed(0)}%`
                        }
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
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

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-6 border border-blue-800/50">
                <h3 className="text-xl font-serif text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Courses:</span>
                    <span className="font-bold text-blue-300">{courses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Workshops:</span>
                    <span className="font-bold text-blue-300">{workshops.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Workshops:</span>
                    <span className="font-bold text-green-400">
                      {getActiveWorkshopsCount()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-6 border border-blue-800/50">
                <h3 className="text-xl font-serif text-white mb-4">Recent Activity</h3>
                <p className="text-gray-400 text-sm">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-white">Manage Courses</h2>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setShowCourseForm(true);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 transition flex items-center border border-blue-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Course
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg overflow-hidden border border-blue-800/50 hover:border-blue-600/50 transition">
                  {/* Course Image or Emoji */}
                  <div className="relative h-32 overflow-hidden border-b border-blue-700">
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
                      className={`absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center text-5xl ${course.imageUrl ? 'hidden' : 'flex'
                        }`}
                    >
                      {getInstrumentEmoji(course.instrument)}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-serif text-white mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-bold text-blue-300">₹{course.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Level:</span>
                        <span className="text-gray-300">{course.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Instrument:</span>
                        <span className="text-gray-300">{course.instrument}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setShowCourseForm(true);
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition flex items-center justify-center border border-blue-500"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition flex items-center justify-center border border-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workshops Tab */}
        {activeTab === 'workshops' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-white">Manage Workshops</h2>
              <button
                onClick={() => {
                  setEditingWorkshop(null);
                  setShowWorkshopForm(true);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 transition flex items-center border border-blue-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Workshop
              </button>
            </div>

            {/* Sub-tabs for Upcoming and Past */}
            <div className="bg-gradient-to-r from-blue-900/40 to-gray-900/40 rounded-lg shadow mb-6 border border-blue-800/50">
              <div className="flex border-b border-blue-800/30">
                <button
                  onClick={() => setActiveTab('workshops')}
                  className="flex-1 px-6 py-3 text-sm font-medium border-b-2 border-blue-400 text-blue-400"
                >
                  Upcoming Workshops
                  <span className="ml-2 bg-green-900/30 text-green-400 px-2 py-1 rounded-full text-xs border border-green-700/50">
                    {workshops.filter(w => new Date(w.date) >= new Date()).length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('workshops-past')}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-400 hover:text-blue-300"
                >
                  Past Workshops
                  <span className="ml-2 bg-gray-900/30 text-gray-400 px-2 py-1 rounded-full text-xs border border-gray-700/50">
                    {workshops.filter(w => new Date(w.date) < new Date()).length}
                  </span>
                </button>
              </div>
            </div>

            {/* Upcoming Workshops */}
            <div className="space-y-4">
              {workshops
                .filter(w => new Date(w.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((workshop) => (
                  <div key={workshop.id} className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-6 border border-blue-800/50">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-serif text-white">{workshop.title}</h3>
                            <span className="px-3 py-1 rounded text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/50">
                              Upcoming
                            </span>
                            <span className="px-3 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-300 flex items-center gap-1 border border-blue-700/50">
                              <Users className="w-3 h-3" />
                              {workshop.current_participants || 0} registered
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedWorkshop(workshop);
                              setShowRegistrationsModal(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition flex items-center whitespace-nowrap border border-green-500"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            View Registrations
                          </button>
                          <button
                            onClick={() => {
                              setEditingWorkshop(workshop);
                              setShowWorkshopForm(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition flex items-center whitespace-nowrap border border-blue-500"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWorkshop(workshop.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition flex items-center whitespace-nowrap border border-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4">{workshop.description}</p>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Instructor: <span className="text-gray-300 font-medium">{workshop.instructor}</span></p>
                          <p className="text-gray-500">Date: <span className="text-gray-300 font-medium">{new Date(workshop.date).toLocaleString()}</span></p>
                          <p className="text-gray-500">Duration: <span className="text-gray-300 font-medium">{workshop.duration} minutes</span></p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price: <span className="text-gray-300 font-medium">₹{workshop.price}</span></p>
                          <p className="text-gray-500">Capacity: <span className="text-gray-300 font-medium">{workshop.current_participants || 0}/{workshop.max_participants}</span></p>
                          <p className="text-gray-500">Link: <a href={workshop.workshop_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">View Link</a></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {workshops.filter(w => new Date(w.date) >= new Date()).length === 0 && (
                <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-12 text-center border border-blue-800/50">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-700" />
                  <h3 className="text-xl font-serif text-white mb-2">No Upcoming Workshops</h3>
                  <p className="text-gray-400">Create a new workshop to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Past Workshops Tab */}
        {activeTab === 'workshops-past' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-white">Past Workshops</h2>
              <button
                onClick={() => setActiveTab('workshops')}
                className="bg-blue-900/30 text-blue-300 px-6 py-3 rounded font-medium hover:bg-blue-900/50 transition flex items-center border border-blue-800/50"
              >
                Back to Upcoming
              </button>
            </div>

            {/* Sub-tabs for Upcoming and Past */}
            <div className="bg-gradient-to-r from-blue-900/40 to-gray-900/40 rounded-lg shadow mb-6 border border-blue-800/50">
              <div className="flex border-b border-blue-800/30">
                <button
                  onClick={() => setActiveTab('workshops')}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-400 hover:text-blue-300"
                >
                  Upcoming Workshops
                  <span className="ml-2 bg-green-900/30 text-green-400 px-2 py-1 rounded-full text-xs border border-green-700/50">
                    {workshops.filter(w => new Date(w.date) >= new Date()).length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('workshops-past')}
                  className="flex-1 px-6 py-3 text-sm font-medium border-b-2 border-blue-400 text-blue-400"
                >
                  Past Workshops
                  <span className="ml-2 bg-gray-900/30 text-gray-400 px-2 py-1 rounded-full text-xs border border-gray-700/50">
                    {workshops.filter(w => new Date(w.date) < new Date()).length}
                  </span>
                </button>
              </div>
            </div>

            {/* Past Workshops */}
            <div className="space-y-4">
              {workshops
                .filter(w => new Date(w.date) < new Date())
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((workshop) => (
                  <div key={workshop.id} className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-6 border border-blue-800/50 opacity-90">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-serif text-white">{workshop.title}</h3>
                            <span className="px-3 py-1 rounded text-xs font-medium bg-gray-900/30 text-gray-400 border border-gray-700/50">
                              Completed
                            </span>
                            <span className="px-3 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-300 flex items-center gap-1 border border-blue-700/50">
                              <Users className="w-3 h-3" />
                              {workshop.current_participants || 0} attended
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedWorkshop(workshop);
                              setShowRegistrationsModal(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition flex items-center whitespace-nowrap border border-green-500"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            View Attendees
                          </button>
                          <button
                            onClick={() => handleDeleteWorkshop(workshop.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition flex items-center whitespace-nowrap border border-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4">{workshop.description}</p>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Instructor: <span className="text-gray-300 font-medium">{workshop.instructor}</span></p>
                          <p className="text-gray-500">Date: <span className="text-gray-300 font-medium">{new Date(workshop.date).toLocaleString()}</span></p>
                          <p className="text-gray-500">Duration: <span className="text-gray-300 font-medium">{workshop.duration} minutes</span></p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price: <span className="text-gray-300 font-medium">₹{workshop.price}</span></p>
                          <p className="text-gray-500">Attendance: <span className="text-gray-300 font-medium">{workshop.current_participants || 0}/{workshop.max_participants}</span></p>
                          <p className="text-gray-500">Revenue: <span className="text-green-400 font-medium">₹{(workshop.current_participants || 0) * workshop.price}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {workshops.filter(w => new Date(w.date) < new Date()).length === 0 && (
                <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-12 text-center border border-blue-800/50">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-700" />
                  <h3 className="text-xl font-serif text-white mb-2">No Past Workshops</h3>
                  <p className="text-gray-400">Past workshops will appear here after they're completed.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-white">Manage Blogs</h2>
              <button
                onClick={() => router.push('/admin/blogs/new')}
                className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 transition flex items-center border border-blue-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Blog
              </button>
            </div>

            <div className="space-y-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="bg-gradient-to-br from-blue-900/40 to-gray-900/40 rounded-lg shadow-lg p-6 border border-blue-800/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-serif text-white">{blog.title}</h3>
                        <span className={`px-3 py-1 rounded text-xs font-medium border ${blog.status === 'published'
                          ? 'bg-green-900/30 text-green-400 border-green-700/50'
                          : 'bg-gray-900/30 text-gray-400 border-gray-700/50'
                          }`}>
                          {blog.status}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-4 line-clamp-2">{blog.excerpt}</p>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Category: <span className="text-gray-300 font-medium">{blog.category}</span></p>
                          <p className="text-gray-500">Views: <span className="text-gray-300 font-medium">{blog.views || 0}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-500">Reactions: <span className="text-gray-300 font-medium">{blog.total_reactions || 0}</span></p>
                          <p className="text-gray-500">Comments: <span className="text-gray-300 font-medium">{blog.total_comments || 0}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-500">Created: <span className="text-gray-300 font-medium">{new Date(blog.created_at).toLocaleDateString()}</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition flex items-center border border-blue-500"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </a>
                      <button
                        onClick={() => router.push(`/admin/blogs/${blog.slug}/edit`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition flex items-center border border-blue-500"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.slug)}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition flex items-center border border-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
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