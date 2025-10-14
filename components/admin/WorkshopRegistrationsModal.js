'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Users, Mail, Phone, Calendar } from 'lucide-react';

export default function WorkshopRegistrationsModal({ workshop, onClose }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [workshop.id]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/workshops/${workshop.id}/registrations`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Registration Date', 'Amount Paid', 'Payment ID'];
    const rows = registrations.map(reg => [
      reg.name || 'N/A',
      reg.email || 'N/A',
      reg.phone || 'N/A',
      new Date(reg.registered_at).toLocaleString(),
      `₹${reg.amount}`,
      reg.razorpay_payment_id || 'N/A'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${workshop.title.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-amber-200">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-amber-900" />
              <h2 className="text-2xl font-serif text-amber-900">Workshop Registrations</h2>
            </div>
            <p className="text-amber-700 font-medium">{workshop.title}</p>
            <p className="text-sm text-amber-600 mt-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              {new Date(workshop.date).toLocaleString()}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-amber-900 text-lg">Loading registrations...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-600">Error: {error}</div>
            </div>
          ) : registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-amber-700">
              <Users className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No registrations yet</p>
              <p className="text-sm">Participants will appear here once they register</p>
            </div>
          ) : (
            <>
              {/* Stats and Download Button */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-6">
                  <div className="bg-amber-50 px-4 py-2 rounded-lg">
                    <p className="text-sm text-amber-600">Total Registrations</p>
                    <p className="text-2xl font-bold text-amber-900">{registrations.length}</p>
                  </div>
                  <div className="bg-green-50 px-4 py-2 rounded-lg">
                    <p className="text-sm text-green-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-900">
                      ₹{registrations.reduce((sum, reg) => sum + (reg.amount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={downloadExcel}
                  className="bg-green-600 text-white px-6 py-3 rounded font-medium hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download CSV
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-amber-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Registration Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Payment ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {registrations.map((registration, index) => (
                      <tr key={registration.id} className="hover:bg-amber-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-900 font-semibold">
                              {(registration.name || 'U')[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {registration.name || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-amber-600" />
                            {registration.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-amber-600" />
                            {registration.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(registration.registered_at).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-700">
                          ₹{registration.amount?.toLocaleString() || '0'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                          {registration.razorpay_payment_id || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-amber-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 px-6 py-3 rounded font-medium hover:bg-gray-400 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}