export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/adminAuth';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get('viewMode') || 'day';
    const period = searchParams.get('period') || '30days';

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch(period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get sales for different periods (stats)
    const { data: todaySales } = await supabaseAdmin
      .rpc('get_sales_stats', { time_period: 'today' });
    
    const { data: weekSales } = await supabaseAdmin
      .rpc('get_sales_stats', { time_period: 'week' });
    
    const { data: monthSales } = await supabaseAdmin
      .rpc('get_sales_stats', { time_period: 'month' });

    // Get sales data for the specified date range
    const { data: salesData, error: salesError } = await supabaseAdmin
      .from('sales_analytics')
      .select('*')
      .gte('sale_date', startDate.toISOString())
      .lte('sale_date', now.toISOString())
      .order('sale_date', { ascending: true });

    if (salesError) {
      console.error('Error fetching sales data:', salesError);
      throw salesError;
    }

    // Calculate sales breakdown (all-time)
    const { data: allTimeSales, error: allTimeError } = await supabaseAdmin
      .from('sales_analytics')
      .select('type, amount');

    if (allTimeError) {
      console.error('Error fetching all-time sales:', allTimeError);
    }

    // Calculate breakdown by type
    let totalSales = 0;
    let courseSales = 0;
    let workshopSales = 0;

    if (allTimeSales && allTimeSales.length > 0) {
      allTimeSales.forEach(sale => {
        const amount = parseFloat(sale.amount) || 0;
        totalSales += amount;
        
        if (sale.type === 'course') {
          courseSales += amount;
        } else if (sale.type === 'workshop') {
          workshopSales += amount;
        }
      });
    }

    // Aggregate data based on viewMode
    const chartData = aggregateData(salesData || [], viewMode, startDate, now);

    return NextResponse.json({
      stats: {
        today: todaySales?.[0]?.total_revenue || 0,
        week: weekSales?.[0]?.total_revenue || 0,
        month: monthSales?.[0]?.total_revenue || 0,
      },
      breakdown: {
        total: totalSales,
        courses: courseSales,
        workshops: workshopSales,
      },
      chartData,
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sales analytics',
      details: error.message 
    }, { status: 500 });
  }
}

function aggregateData(salesData, viewMode, startDate, endDate) {
  const dataMap = new Map();

  // Initialize empty data points
  const current = new Date(startDate);
  
  while (current <= endDate) {
    let key;
    let displayDate;
    
    switch(viewMode) {
      case 'day':
        key = current.toISOString().split('T')[0];
        displayDate = new Date(current).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dataMap.set(key, { period: displayDate, sales: 0, revenue: 0 });
        current.setDate(current.getDate() + 1);
        break;
        
      case 'week':
        const weekStart = new Date(current);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        key = weekStart.toISOString().split('T')[0];
        displayDate = `Week of ${new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        if (!dataMap.has(key)) {
          dataMap.set(key, { period: displayDate, sales: 0, revenue: 0 });
        }
        current.setDate(current.getDate() + 7);
        break;
        
      case 'month':
        key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        displayDate = new Date(current).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (!dataMap.has(key)) {
          dataMap.set(key, { period: displayDate, sales: 0, revenue: 0 });
        }
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  // Aggregate sales data
  salesData.forEach(sale => {
    const saleDate = new Date(sale.sale_date);
    let key;

    switch(viewMode) {
      case 'day':
        key = saleDate.toISOString().split('T')[0];
        break;
        
      case 'week':
        const weekStart = new Date(saleDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
        
      case 'month':
        key = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    if (dataMap.has(key)) {
      const entry = dataMap.get(key);
      entry.sales += 1;
      entry.revenue += parseFloat(sale.amount) || 0;
      dataMap.set(key, entry);
    }
  });

  // Convert to array and sort by date
  return Array.from(dataMap.values());
}