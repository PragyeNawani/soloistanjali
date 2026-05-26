'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

export default function TimePicker({ value, onChange, label = "Time" }) {
  const [showPicker, setShowPicker] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState('PM');
  const pickerRef = useRef(null);

  // Parse the incoming datetime value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      
      setHour(hours);
      setMinute(minutes);
      setPeriod(ampm);
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const updateTime = (newHour, newMinute, newPeriod) => {
    if (!value) return;

    const date = new Date(value);
    let hours24 = newHour;
    
    if (newPeriod === 'PM' && newHour !== 12) {
      hours24 = newHour + 12;
    } else if (newPeriod === 'AM' && newHour === 12) {
      hours24 = 0;
    }
    
    date.setHours(hours24);
    date.setMinutes(newMinute);
    
    // Return in format: YYYY-MM-DDTHH:MM
    const formatted = date.toISOString().slice(0, 16);
    onChange(formatted);
  };

  const incrementHour = () => {
    const newHour = hour === 12 ? 1 : hour + 1;
    setHour(newHour);
    updateTime(newHour, minute, period);
  };

  const decrementHour = () => {
    const newHour = hour === 1 ? 12 : hour - 1;
    setHour(newHour);
    updateTime(newHour, minute, period);
  };

  const incrementMinute = () => {
    const newMinute = minute === 59 ? 0 : minute + 1;
    setMinute(newMinute);
    updateTime(hour, newMinute, period);
  };

  const decrementMinute = () => {
    const newMinute = minute === 0 ? 59 : minute - 1;
    setMinute(newMinute);
    updateTime(hour, newMinute, period);
  };

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM';
    setPeriod(newPeriod);
    updateTime(hour, newMinute, newPeriod);
  };

  const formatTime = () => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="relative" ref={pickerRef}>
      <label className="block text-sm font-medium text-amber-900 mb-2">
        {label}
      </label>
      
      {/* Time Display Button */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="w-full px-4 py-3 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-left flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <span className="text-gray-900 font-medium">{formatTime()}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-amber-600 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
      </button>

      {/* Time Picker Dropdown */}
      {showPicker && (
        <div className="absolute z-50 mt-2 bg-white border-2 border-amber-200 rounded-lg shadow-2xl p-6 w-full">
          <div className="flex items-center justify-center gap-4">
            {/* Hour Picker */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={incrementHour}
                className="p-2 hover:bg-amber-100 rounded transition"
              >
                <ChevronUp className="w-5 h-5 text-amber-600" />
              </button>
              <div className="w-16 h-16 flex items-center justify-center bg-amber-50 rounded-lg border-2 border-amber-200 my-2">
                <span className="text-3xl font-bold text-amber-900">{hour.toString().padStart(2, '0')}</span>
              </div>
              <button
                type="button"
                onClick={decrementHour}
                className="p-2 hover:bg-amber-100 rounded transition"
              >
                <ChevronDown className="w-5 h-5 text-amber-600" />
              </button>
              <span className="text-xs text-amber-600 mt-2">Hour</span>
            </div>

            {/* Colon */}
            <div className="text-4xl font-bold text-amber-900 mb-8">:</div>

            {/* Minute Picker */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={incrementMinute}
                className="p-2 hover:bg-amber-100 rounded transition"
              >
                <ChevronUp className="w-5 h-5 text-amber-600" />
              </button>
              <div className="w-16 h-16 flex items-center justify-center bg-amber-50 rounded-lg border-2 border-amber-200 my-2">
                <span className="text-3xl font-bold text-amber-900">{minute.toString().padStart(2, '0')}</span>
              </div>
              <button
                type="button"
                onClick={decrementMinute}
                className="p-2 hover:bg-amber-100 rounded transition"
              >
                <ChevronDown className="w-5 h-5 text-amber-600" />
              </button>
              <span className="text-xs text-amber-600 mt-2">Minute</span>
            </div>

            {/* AM/PM Toggle */}
            <div className="flex flex-col items-center ml-2">
              <button
                type="button"
                onClick={togglePeriod}
                className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 transition ${
                  period === 'AM' 
                    ? 'bg-amber-600 border-amber-600 text-white' 
                    : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50'
                }`}
              >
                <span className="text-xl font-bold">AM</span>
              </button>
              <button
                type="button"
                onClick={togglePeriod}
                className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 transition mt-2 ${
                  period === 'PM' 
                    ? 'bg-amber-600 border-amber-600 text-white' 
                    : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50'
                }`}
              >
                <span className="text-xl font-bold">PM</span>
              </button>
              <span className="text-xs text-amber-600 mt-2">Period</span>
            </div>
          </div>

          {/* Quick Select Options */}
          <div className="mt-6 pt-4 border-t border-amber-200">
            <p className="text-xs text-amber-600 mb-2">Quick Select:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '9:00 AM', h: 9, m: 0, p: 'AM' },
                { label: '12:00 PM', h: 12, m: 0, p: 'PM' },
                { label: '3:00 PM', h: 3, m: 0, p: 'PM' },
                { label: '6:00 PM', h: 6, m: 0, p: 'PM' },
                { label: '8:00 PM', h: 8, m: 0, p: 'PM' },
                { label: '10:00 PM', h: 10, m: 0, p: 'PM' },
              ].map((time) => (
                <button
                  key={time.label}
                  type="button"
                  onClick={() => {
                    setHour(time.h);
                    setMinute(time.m);
                    setPeriod(time.p);
                    updateTime(time.h, time.m, time.p);
                  }}
                  className="px-3 py-2 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 rounded border border-amber-200 transition"
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="w-full mt-4 bg-amber-600 text-white px-4 py-2 rounded font-medium hover:bg-amber-700 transition"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}