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
    <div className="rounded-lg hover:shadow-2xl overflow-hidden hover:shadow-blue-900/50  transition-all duration-300 border border-primarycontainer">
      <div className="bg-gradient-to-br from-[#11244A] to-[#0B1C3E] h-48 flex items-center justify-center border-b border-blue-900/30">
        <div className="text-center">
          <div className="text-6xl mb-2">🎼</div>
          <div className="text-blue-200 font-medium">{workshop.instructor}</div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-serif text-primarytext mb-2">
            {workshop.title}
          </h3>
          <p className="text-blue-900 text-sm">{workshop.description}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-blue-800">
            <Calendar className="w-4 h-4 mr-2 text-blue-800" />
            <span>{formatDate(workshop.date)}</span>
          </div>
          <div className="flex items-center text-blue-800">
            <Clock className="w-4 h-4 mr-2 text-blue-800" />
            <span>
              {formatTime(workshop.date)} • {workshop.duration} minutes
            </span>
          </div>
          <div className="flex items-center text-blue-800">
            <User className="w-4 h-4 mr-2 text-blue-800" />
            <span>Instructor: {workshop.instructor}</span>
          </div>
          <div className="flex items-center text-blue-800">
            <Users className="w-4 h-4 mr-2 text-blue-800" />
            <span>
              {workshop.current_participants} / {workshop.max_participants}{' '}
              participants
              {spotsLeft <= 10 && spotsLeft > 0 && (
                <span className="ml-2 text-red-400 font-medium">
                  Only {spotsLeft} spots left!
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-blue-900/30">
          <span className="text-2xl font-bold text-blue-800">
            ₹{workshop.price}
          </span>
          {isRegistered ? (
            <div className="bg-green-600/20 text-green-400 px-6 py-2 text-sm font-medium rounded border border-green-500/30 shadow-lg shadow-green-600/20">
              ✓ Registered
            </div>
          ) : isFull ? (
            <div className="bg-gray-800/50 text-gray-400 px-6 py-2 text-sm font-medium rounded cursor-not-allowed border border-gray-700/50">
              Fully Booked
            </div>
          ) : (
            <button
              onClick={() => onRegister(workshop)}
              className="bg-primarycontainer text-white px-6 py-2 text-sm font-medium rounded hover:bg-blue-800 transition border border-blue-500"
            >
              Register Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}