import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/adminAuth';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sales for different periods
    const { data: todaySales } = await supabaseAdmin
      .rpc('get_sales_stats', { time_period: 'today' });
    
    const { data: weekSales } = await supabaseAdmin
      .rpc('get_sales_stats', { time_period: 'week' });
    
    const { data: monthSales } = await supabaseAdmin
      .rpc('get_sales_stats', { time_period: 'month' });

    // Get daily sales for chart (last 7 days)
    const { data: dailySales } = await supabaseAdmin
      .from('sales_analytics')
      .select('*')
      .gte('sale_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Group by date for chart
    const salesByDate = {};
    dailySales.forEach(sale => {
      const date = new Date(sale.sale_date).toLocaleDateString();
      if (!salesByDate[date]) {
        salesByDate[date] = { period: date, sales: 0, revenue: 0 };
      }
      salesByDate[date].sales += 1;
      salesByDate[date].revenue += sale.amount;
    });

    const chartData = Object.values(salesByDate);

    return NextResponse.json({
      stats: {
        today: todaySales[0]?.total_revenue || 0,
        week: weekSales[0]?.total_revenue || 0,
        month: monthSales[0]?.total_revenue || 0,
      },
      chartData,
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}