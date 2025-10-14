'use client';

import React from 'react';
import { Calendar, Clock, Users, User } from 'lucide-react';

export default function WorkshopCard({ workshop, onRegister, isRegistered }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isFull = workshop.current_participants >= workshop.max_participants;
  const spotsLeft = workshop.max_participants - workshop.current_participants;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 h-48 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-2">🎼</div>
          <div className="text-amber-900 font-medium">{workshop.instructor}</div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-serif text-amber-900 mb-2">
            {workshop.title}
          </h3>
          <p className="text-amber-700 text-sm">{workshop.description}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-amber-700">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(workshop.date)}</span>
          </div>
          <div className="flex items-center text-amber-700">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              {formatTime(workshop.date)} • {workshop.duration} minutes
            </span>
          </div>
          <div className="flex items-center text-amber-700">
            <User className="w-4 h-4 mr-2" />
            <span>Instructor: {workshop.instructor}</span>
          </div>
          <div className="flex items-center text-amber-700">
            <Users className="w-4 h-4 mr-2" />
            <span>
              {workshop.current_participants} / {workshop.max_participants}{' '}
              participants
              {spotsLeft <= 10 && spotsLeft > 0 && (
                <span className="ml-2 text-red-600 font-medium">
                  Only {spotsLeft} spots left!
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-amber-100">
          <span className="text-2xl font-bold text-amber-900">
            ₹{workshop.price}
          </span>
          {isRegistered ? (
            <div className="bg-green-100 text-green-700 px-6 py-2 text-sm font-medium rounded">
              ✓ Registered
            </div>
          ) : isFull ? (
            <div className="bg-gray-300 text-gray-600 px-6 py-2 text-sm font-medium rounded cursor-not-allowed">
              Fully Booked
            </div>
          ) : (
            <button
              onClick={() => onRegister(workshop)}
              className="bg-amber-900 text-white px-6 py-2 text-sm font-medium rounded hover:bg-amber-800 transition"
            >
              Register Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}