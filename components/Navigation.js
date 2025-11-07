'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Music, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useNavContext } from '@/Context/context';
export default function Navigation({ user }) {
  const { navani, setNavani } = useNavContext()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const dropdownRef = useRef(null);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Trigger animation on mount
  useEffect(() => {
    setTimeout(() => setHasAnimated(true), 100);
  }, []);

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
    <nav
      className={`${navani ? `fixed top-0 left-0 right-0 z-50 v transition-all duration-300 ease-out translate-y-0 opacity-100 navscroll bg-gradient-to-l from-gray-950 to-blue-950` : `fixed top-0 left-0 right-0 z-50  transition-all duration-700 ease-out ${pathname != "/" ?'bg-gradient-to-l from-gray-950 to-blue-950':'bg-transparent'} ${hasAnimated ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}`}
      style={{
        backdropFilter: 'blur(0px)',
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center cursor-pointer">
            <Music className="text-blue-400 w-8 h-8 mr-2" />
            <span className="text-2xl font-serif text-white">SOLOISTANJALI</span>
            {/* <span className="text-sm text-blue-300 ml-1">STUDIO</span> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 md:gap-2">
            <Link
              href="/"
              className={`text-sm ${pathname === '/'
                ? 'text-blue-700 font-bold bg-white bg-opacity-[90%] p-2 px-4 rounded-full'
                : 'text-gray-50 hover:rounded-full hover:text-blue-700 p-2 px-4 hover:py-2 hover:bg-white hover:bg-opacity-[70%]  font-semibold'
                }`}
            >
              STUDIO INFO
            </Link>
            <Link
              href="/courses"
              className={`text-sm ${pathname === '/courses'
                ? 'text-blue-700 font-bold bg-white bg-opacity-[90%] p-2 px-4 rounded-full'
                : 'text-gray-50 hover:rounded-full hover:text-blue-700 p-2 px-4 hover:py-2 hover:bg-white hover:bg-opacity-[70%]  font-semibold'
                }`}
            >
              MARKETPLACE
            </Link>
            <Link
              href="/workshops"
              className={`text-sm  ${pathname === '/workshops'
                ? 'text-blue-700 font-bold bg-white bg-opacity-[90%] p-2 px-4 rounded-full'
                : 'text-gray-50 hover:rounded-full hover:text-blue-700 p-2 px-4 hover:py-2 hover:bg-white hover:bg-opacity-[70%]  font-semibold'
                }`}
            >
              WORKSHOPS
            </Link>
            <Link
              href="/blog"
              className={`text-sm ${pathname === '/blog'
                ? 'text-blue-700 font-bold bg-white bg-opacity-[90%] p-2 px-4 rounded-full'
                : 'text-gray-50 hover:rounded-full hover:text-blue-700 p-2 px-4 hover:py-2 hover:bg-white hover:bg-opacity-[70%]  font-semibold'
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
                      className={`w-4 h-4 text-blue-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-2xl border border-blue-800 overflow-hidden z-50 animate-slideDown">
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
          <div className="md:hidden pb-4 space-y-2 bg-gradient-to-b from-gray-900 to-blue-950 border-t border-blue-800 animate-slideDown">
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

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}