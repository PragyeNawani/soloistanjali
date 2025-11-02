'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Music } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  // Prevent multiple simultaneous submissions
  const isSubmitting = useRef(false);
  const lastSubmitTime = useRef(0);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please log in.');
    }
    if (searchParams.get('reset') === 'true') {
      setSuccessMessage('Password reset email sent! Please check your inbox.');
    }
    if (searchParams.get('password-updated') === 'true') {
      setSuccessMessage('Password updated successfully! Please log in with your new password.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting.current) {
      console.log('Already submitting, ignoring duplicate request');
      return;
    }

    // Rate limiting: prevent submissions within 2 seconds of each other
    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) {
      setError('Please wait a moment before trying again.');
      return;
    }

    setError('');
    setLoading(true);
    isSubmitting.current = true;
    lastSubmitTime.current = now;

    try {
      console.log('Attempting login...');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log('Login response:', { data, error: signInError });

      if (signInError) {
        throw signInError;
      }

      if (data.session) {
        console.log('Login successful, redirecting...');
        router.push('/dashboard');
        router.refresh();
      } else {
        throw new Error('No session returned');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle rate limit errors specifically
      if (err.message?.includes('rate limit')) {
        setError('Too many login attempts. Please wait a few minutes before trying again.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-16 flex items-center justify-center pt-24">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <Music className="w-12 h-12 text-amber-900 mx-auto mb-4" />
            <h1 className="text-3xl font-serif text-amber-900">Welcome Back</h1>
            <p className="text-amber-700 mt-2">Sign in to your account</p>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-amber-900">
                  Password
                </label>
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-amber-900 hover:text-amber-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-900 text-white py-3 rounded font-medium hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-amber-700">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-amber-900 font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}