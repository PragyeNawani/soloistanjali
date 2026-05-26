'use client';

import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const totalSales = payload.find(p => p.dataKey === 'sales')?.value || 0;
    const totalRevenue = payload.find(p => p.dataKey === 'revenue')?.value || 0;

    return (
      <div className="bg-gradient-to-br from-[#0B1C3E] to-[#061831] border border-blue-800/50 rounded-lg shadow-2xl p-4 min-w-[200px]">
        <p className="font-bold text-white mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-300">● Sales Count:</span>
            <span className="font-semibold text-blue-400">{totalSales}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-teal-300">● Revenue:</span>
            <span className="font-semibold text-teal-400">₹{totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Legend Component
const CustomLegend = () => {
  return (
    <div className="flex justify-center gap-6 mt-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
        <span className="text-blue-200">Sales Count</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-teal-500 rounded"></div>
        <span className="text-blue-200">Revenue (₹)</span>
      </div>
    </div>
  );
};

export default function SalesChart({ data: initialData }) {
  const [viewMode, setViewMode] = useState('day');
  const [period, setPeriod] = useState('30days');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data based on view mode and period
  useEffect(() => {
    fetchSalesData();
  }, [viewMode, period]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/sales-analytics?viewMode=${viewMode}&period=${period}`);
      const data = await response.json();
      
      if (data.chartData && Array.isArray(data.chartData)) {
        setChartData(data.chartData);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Fallback to initial data if fetch fails
      if (initialData && Array.isArray(initialData)) {
        setChartData(initialData);
      } else {
        setChartData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary stats
  const totalSales = chartData.reduce((sum, item) => sum + (item.sales || 0), 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const avgRevenue = chartData.length > 0 
    ? (totalRevenue / chartData.length).toFixed(0)
    : 0;

  return (
    <div className="bg-gradient-to-r from-gray-950 via-blue-950 to-gray-950 rounded-lg shadow-2xl p-6 border border-blue-900/30">
      {/* Header */}
      <div className="flex items-center flex-wrap justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h3 className="text-2xl font-serif text-white">Sales History</h3>
          {loading && (
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-blue-300">By:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                value="day"
                checked={viewMode === 'day'}
                onChange={(e) => setViewMode(e.target.value)}
                className="text-blue-500 accent-blue-500"
                disabled={loading}
              />
              <span className="text-blue-200">Day</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                value="week"
                checked={viewMode === 'week'}
                onChange={(e) => setViewMode(e.target.value)}
                className="text-blue-500 accent-blue-500"
                disabled={loading}
              />
              <span className="text-blue-200">Week</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                value="month"
                checked={viewMode === 'month'}
                onChange={(e) => setViewMode(e.target.value)}
                className="text-blue-500 accent-blue-500"
                disabled={loading}
              />
              <span className="text-blue-200">Month</span>
            </label>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-300">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              disabled={loading}
              className="px-3 py-1 bg-[#11244A] border border-blue-800/50 rounded text-sm text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="7days">7 days</option>
              <option value="30days">30 days</option>
              <option value="3months">3 months</option>
              <option value="6months">6 months</option>
              <option value="1year">1 year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 ">
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 rounded-lg p-4 border border-blue-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-300 font-medium">Total Sales</span>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalSales}</p>
          <p className="text-xs text-blue-400 mt-1">{totalSales} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-teal-900/40 to-teal-950/40 rounded-lg p-4 border border-teal-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-teal-300 font-medium">Total Revenue</span>
            <TrendingUp className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-teal-400 mt-1">
            {totalSales > 0 ? `₹${(totalRevenue / totalSales).toFixed(0)} per sale` : 'N/A'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-900/40 to-green-950/40 rounded-lg p-4 border border-green-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-300 font-medium">Avg Revenue</span>
            <Calendar className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">₹{avgRevenue}</p>
          <p className="text-xs text-green-400 mt-1">Per {viewMode === 'day' ? 'day' : viewMode === 'week' ? 'week' : 'month'}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="border-t border-blue-900/30 pt-6">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
              <p className="text-blue-300">Loading data...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-300">No sales data available for this period</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
              
              <XAxis
                dataKey="period"
                stroke="#93c5fd"
                style={{ fontSize: '12px' }}
                tickMargin={10}
                angle={viewMode === 'week' ? -45 : 0}
                textAnchor={viewMode === 'week' ? 'end' : 'middle'}
                height={viewMode === 'week' ? 80 : 40}
              />
              
              <YAxis
                yAxisId="left"
                stroke="#93c5fd"
                style={{ fontSize: '12px' }}
                label={{ value: 'Sales Count', angle: -90, position: 'insideLeft', style: { fill: '#93c5fd' } }}
              />
              
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#5eead4"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                label={{ value: 'Revenue (₹)', angle: 90, position: 'insideRight', style: { fill: '#5eead4' } }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Bar
                yAxisId="left"
                dataKey="sales"
                fill="url(#colorSales)"
                radius={[8, 8, 0, 0]}
                name="Sales Count"
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ fill: '#14b8a6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        
        {chartData.length > 0 && <CustomLegend />}
      </div>

      {/* Footer Stats */}
      {chartData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-blue-900/30 flex justify-between text-sm text-blue-300">
          <div>
            <span className="font-medium">Data Points:</span> {chartData.length}
          </div>
          <div>
            <span className="font-medium">View:</span> {viewMode === 'day' ? 'Daily' : viewMode === 'week' ? 'Weekly' : 'Monthly'}
          </div>
          <div>
            <span className="font-medium">Period:</span> {period.replace('days', ' days').replace('months', ' months').replace('year', ' year')}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {new Date().toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}