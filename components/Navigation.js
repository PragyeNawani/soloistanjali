'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Music, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Navigation({ user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <nav className="bg-gradient-to-r from-gray-950 via-blue-950 to-gray-950 shadow-lg sticky top-0 z-50 border-b border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center cursor-pointer">
            <Music className="text-blue-400 w-8 h-8 mr-2" />
            <span className="text-2xl font-serif text-white">CHORDS</span>
            <span className="text-sm text-blue-300 ml-1">STUDIO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition duration-300 ${
                pathname === '/'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-blue-300'
              }`}
            >
              STUDIO INFO
            </Link>
            <Link
              href="/courses"
              className={`text-sm font-medium transition duration-300 ${
                pathname === '/courses'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-blue-300'
              }`}
            >
              COURSES
            </Link>
            <Link
              href="/workshops"
              className={`text-sm font-medium transition duration-300 ${
                pathname === '/workshops'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-blue-300'
              }`}
            >
              WORKSHOPS
            </Link>
            <Link
              href="/blog"
              className={`text-sm font-medium transition duration-300 ${
                pathname === '/blog'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-blue-300'
              }`}
            >
              BLOGS
            </Link>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* User Avatar with Dropdown Trigger */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-900/30 transition duration-300 border border-blue-800/50"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {getUserInitials()}
                  </div>
                  <div className="hidden lg:flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-300">
                      {getUserDisplayName()}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-blue-400 transition-transform ${
                        userDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-2xl border border-blue-800 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-blue-800/50 bg-gradient-to-r from-blue-900/30 to-gray-900/30">
                      <p className="text-sm font-medium text-white">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-blue-400">{user?.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-300 hover:bg-blue-900/30 hover:text-blue-300 transition duration-300"
                    >
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition duration-300 flex items-center border-t border-blue-800/50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 transition duration-300 rounded border border-blue-500"
                >
                  LOGIN
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-blue-400"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 bg-gradient-to-b from-gray-900 to-blue-950 border-t border-blue-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-400 hover:text-blue-300 hover:bg-blue-900/30"
            >
              STUDIO INFO
            </Link>
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-400 hover:text-blue-300 hover:bg-blue-900/30"
            >
              COURSES
            </Link>
            <Link
              href="/workshops"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-400 hover:text-blue-300 hover:bg-blue-900/30"
            >
              WORKSHOPS
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-400 hover:text-blue-300 hover:bg-blue-900/30"
            >
              BLOG
            </Link>
            {user ? (
              <>
                <div className="px-4 py-3 border-t border-b border-blue-800 bg-gradient-to-r from-blue-900/30 to-gray-900/30">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-blue-400">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-400 hover:text-blue-300 hover:bg-blue-900/30"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-400 hover:text-blue-300 hover:bg-blue-900/30"
                >
                  LOGIN
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}