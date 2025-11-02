import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    // Verify the request is from a cron job (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== Cleanup Pending/Failed Course Purchases Started ===');

    // Calculate the cutoff time (24 hours ago)
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24);
    const cutoffTimeISO = cutoffTime.toISOString();

    console.log('Deleting pending/failed purchases older than:', cutoffTimeISO);

    // Delete pending and failed purchases older than 24 hours
    const { data: deletedPurchases, error: deleteError } =
      await supabaseAdmin
        .from('purchases')
        .delete()
        .in('status', ['pending', 'failed'])
        .lt('created_at', cutoffTimeISO)
        .select();

    if (deleteError) {
      console.error('Error deleting old purchases:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    const deletedCount = deletedPurchases?.length || 0;
    console.log(`✅ Deleted ${deletedCount} old pending/failed course purchases`);

    // Optional: Log which purchases were deleted
    if (deletedCount > 0) {
      console.log('Deleted purchase IDs:', 
        deletedPurchases.map(p => p.id).join(', ')
      );
      
      // Group by status for better logging
      const byStatus = deletedPurchases.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});
      console.log('Deleted by status:', byStatus);
    }

    console.log('=== Cleanup Completed Successfully ===');

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} pending/failed course purchases`,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup: ' + error.message },
      { status: 500 }
    );
  }
}

// Allow POST as well for manual triggers
export async function POST(request) {
  return GET(request);
}