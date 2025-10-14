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
    const percentage = totalSales > 0 ? ((totalRevenue / totalSales) * 100).toFixed(2) : 0;

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[200px]">
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">● Total Sales:</span>
            <span className="font-semibold text-blue-600">₹{totalSales.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">● Revenue:</span>
            <span className="font-semibold text-teal-600">₹{totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">● Percentage:</span>
            <span className="font-semibold text-green-600">{percentage}%</span>
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
        <div className="w-4 h-4 bg-blue-600 rounded"></div>
        <span className="text-gray-700">Total Sales</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-teal-500 rounded"></div>
        <span className="text-gray-700">Revenue (₹)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
        <span className="text-gray-700">Growth (%)</span>
      </div>
    </div>
  );
};

export default function SalesChart({ data: initialData }) {
  const [viewMode, setViewMode] = useState('month');
  const [period, setPeriod] = useState('1year');
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
      
      if (data.chartData) {
        const processed = processData(data.chartData);
        setChartData(processed);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Fallback to initial data if fetch fails
      if (initialData) {
        setChartData(processData(initialData));
      }
    } finally {
      setLoading(false);
    }
  };

  const processData = (rawData) => {
    if (!rawData || rawData.length === 0) return [];

    // Filter data based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }

    // Group data by view mode (week or month)
    const groupedData = groupDataByViewMode(rawData, viewMode, startDate);

    // Calculate percentages
    return groupedData.map(item => ({
      ...item,
      percentage: item.sales > 0 ? ((item.revenue / item.sales) * 100).toFixed(2) : 0,
    }));
  };

  const groupDataByViewMode = (data, mode, startDate) => {
    const grouped = {};

    data.forEach(item => {
      const itemDate = new Date(item.sale_date || item.period);
      
      // Skip if before start date
      if (itemDate < startDate) return;

      let key;
      if (mode === 'week') {
        // Group by week
        const weekStart = getWeekStart(itemDate);
        key = formatWeek(weekStart);
      } else {
        // Group by month
        key = formatMonth(itemDate);
      }

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          sales: 0,
          revenue: 0,
          count: 0,
        };
      }

      grouped[key].sales += item.sales || item.amount || 0;
      grouped[key].revenue += item.revenue || item.amount || 0;
      grouped[key].count += 1;
    });

    // Convert to array and sort
    return Object.values(grouped).sort((a, b) => {
      return new Date(a.period) - new Date(b.period);
    });
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
  };

  const formatWeek = (date) => {
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    return `Week ${date.getDate()}/${date.getMonth() + 1}`;
  };

  const formatMonth = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Calculate summary stats
  const totalSales = chartData.reduce((sum, item) => sum + (item.sales || 0), 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const avgPercentage = chartData.length > 0 
    ? (chartData.reduce((sum, item) => sum + parseFloat(item.percentage || 0), 0) / chartData.length).toFixed(2)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-2xl font-serif text-gray-800">Sales History</h3>
          {loading && (
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">By:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                value="week"
                checked={viewMode === 'week'}
                onChange={(e) => setViewMode(e.target.value)}
                className="text-blue-600"
                disabled={loading}
              />
              <span className="text-gray-700">Week</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                value="month"
                checked={viewMode === 'month'}
                onChange={(e) => setViewMode(e.target.value)}
                className="text-blue-600"
                disabled={loading}
              />
              <span className="text-gray-700">Month</span>
            </label>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              disabled={loading}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="1month">1 month</option>
              <option value="3months">3 months</option>
              <option value="6months">6 months</option>
              <option value="1year">1 year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">Total Sales</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{totalSales.toLocaleString()}</p>
          {/* <p className="text-xs text-blue-600 mt-1">{chartData.length} transactions</p> */}
          <p className="text-xs text-blue-600 mt-1">{totalSales.toLocaleString()} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-teal-700 font-medium">Revenue</span>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-900">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-teal-600 mt-1">
            {totalSales > 0 ? `${((totalRevenue / totalSales) * 100).toFixed(1)}% of sales` : 'N/A'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">Avg Growth</span>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{avgPercentage}%</p>
          <p className="text-xs text-green-600 mt-1">Per {viewMode === 'week' ? 'week' : 'month'}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="border-t border-gray-200 pt-6">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No sales data available for this period</p>
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
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              
              <XAxis
                dataKey="period"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickMargin={10}
                angle={viewMode === 'week' ? -45 : 0}
                textAnchor={viewMode === 'week' ? 'end' : 'middle'}
                height={viewMode === 'week' ? 80 : 40}
              />
              
              <YAxis
                yAxisId="left"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Bar
                yAxisId="left"
                dataKey="sales"
                fill="url(#colorSales)"
                radius={[8, 8, 0, 0]}
                barSize={viewMode === 'week' ? 30 : 40}
              />
              
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="url(#colorRevenue)"
                radius={[8, 8, 0, 0]}
                barSize={viewMode === 'week' ? 30 : 40}
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentage"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        
        {chartData.length > 0 && <CustomLegend />}
      </div>

      {/* Footer Stats */}
      {chartData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Data Points:</span> {chartData.length}
          </div>
          <div>
            <span className="font-medium">View:</span> {viewMode === 'week' ? 'Weekly' : 'Monthly'}
          </div>
          <div>
            <span className="font-medium">Period:</span> {period.replace('1', '').replace('months', ' months').replace('month', ' month').replace('year', ' year')}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}