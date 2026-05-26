import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    // Verify the request is from a cron job (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== Unified Cleanup Started ===');

    // Calculate the cutoff time (24 hours ago)
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24);
    const cutoffTimeISO = cutoffTime.toISOString();

    console.log('Cleaning up records older than:', cutoffTimeISO);

    const results = {
      workshopRegistrations: 0,
      coursePurchases: 0,
      errors: [],
    };

    // 1. Cleanup Workshop Registrations
    try {
      const { data: deletedRegistrations, error: registrationError } =
        await supabaseAdmin
          .from('workshop_registrations')
          .delete()
          .eq('status', 'pending')
          .lt('registered_at', cutoffTimeISO)
          .select();

      if (registrationError) {
        console.error('Error deleting workshop registrations:', registrationError);
        results.errors.push({
          table: 'workshop_registrations',
          error: registrationError.message,
        });
      } else {
        results.workshopRegistrations = deletedRegistrations?.length || 0;
        console.log(`✅ Deleted ${results.workshopRegistrations} old pending workshop registrations`);
      }
    } catch (error) {
      console.error('Workshop cleanup error:', error);
      results.errors.push({
        table: 'workshop_registrations',
        error: error.message,
      });
    }

    // 2. Cleanup Course Purchases
    try {
      const { data: deletedPurchases, error: purchaseError } =
        await supabaseAdmin
          .from('purchases')
          .delete()
          .in('status', ['pending', 'failed'])
          .lt('created_at', cutoffTimeISO)
          .select();

      if (purchaseError) {
        console.error('Error deleting purchases:', purchaseError);
        results.errors.push({
          table: 'purchases',
          error: purchaseError.message,
        });
      } else {
        results.coursePurchases = deletedPurchases?.length || 0;
        console.log(`✅ Deleted ${results.coursePurchases} old pending/failed purchases`);
        
        // Log breakdown by status
        if (deletedPurchases?.length > 0) {
          const byStatus = deletedPurchases.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
          }, {});
          console.log('Purchases deleted by status:', byStatus);
        }
      }
    } catch (error) {
      console.error('Purchase cleanup error:', error);
      results.errors.push({
        table: 'purchases',
        error: error.message,
      });
    }

    const totalDeleted = results.workshopRegistrations + results.coursePurchases;
    
    console.log('=== Cleanup Summary ===');
    console.log(`Total records deleted: ${totalDeleted}`);
    console.log(`- Workshop registrations: ${results.workshopRegistrations}`);
    console.log(`- Course purchases: ${results.coursePurchases}`);
    if (results.errors.length > 0) {
      console.log(`- Errors encountered: ${results.errors.length}`);
    }
    console.log('=== Cleanup Completed ===');

    return NextResponse.json({
      success: results.errors.length === 0,
      totalDeleted,
      breakdown: {
        workshopRegistrations: results.workshopRegistrations,
        coursePurchases: results.coursePurchases,
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
      message: `Cleaned up ${totalDeleted} records (${results.workshopRegistrations} workshops, ${results.coursePurchases} courses)`,
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