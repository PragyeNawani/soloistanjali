import React from 'react';
import Link from 'next/link';
import { Music } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-950 via-blue-950 to-gray-950 text-white border-t border-blue-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 py-16">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Music className="w-6 h-6 mr-2 text-blue-400" />
              <span className="text-xl font-serif text-white">CHORDS</span>
              <span className="text-sm text-blue-300 ml-1">STUDIO</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Expert music instruction for all ages. Learn guitar, piano, cello, and more with professional instructors.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="text-blue-400 hover:text-blue-300 transition">
                f
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition">
                𝕏
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition">
                📷
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition">
                ▶
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-sm text-white tracking-wide">QUICK LINKS</h4>
            <div className="space-y-3 text-sm">
              <Link
                href="/"
                className="text-gray-400 hover:text-blue-400 transition duration-300 block"
              >
                STUDIO INFO
              </Link>
              <Link
                href="/courses"
                className="text-gray-400 hover:text-blue-400 transition duration-300 block"
              >
                COURSES
              </Link>
              <Link
                href="/workshops"
                className="text-gray-400 hover:text-blue-400 transition duration-300 block"
              >
                WORKSHOPS
              </Link>
              <Link
                href="/blog"
                className="text-gray-400 hover:text-blue-400 transition duration-300 block"
              >
                BLOG
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-blue-400 transition duration-300 block"
              >
                DASHBOARD
              </Link>
            </div>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="font-semibold mb-6 text-sm text-white tracking-wide">CONNECT</h4>
            <div className="space-y-3 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition duration-300 block"
              >
                INSTAGRAM
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition duration-300 block"
              >
                FACEBOOK
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition duration-300 block"
              >
                YOUTUBE
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition duration-300 block"
              >
                TIKTOK
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-900/30"></div>

        {/* Bottom Section */}
        <div className="py-8 text-center text-sm text-gray-400 space-y-2">
          <div className="flex justify-center space-x-6 mb-4">
            <a href="#" className="hover:text-blue-400 transition duration-300">
              PRIVACY POLICY
            </a>
            <span className="text-blue-900/50">|</span>
            <a href="#" className="hover:text-blue-400 transition duration-300">
              TERMS OF SERVICE
            </a>
            <span className="text-blue-900/50">|</span>
            <a href="#" className="hover:text-blue-400 transition duration-300">
              CONTACT
            </a>
          </div>
          <p>© 2025 CHORDS STUDIO. All rights reserved.</p>
          <p className="text-xs text-gray-500">
            Designed with <span className="text-blue-400">♪</span> for music lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}