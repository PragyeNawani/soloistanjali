import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== Testing Supabase Configuration ===');
    
    // Test 1: Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('✅ Environment variables:', { hasUrl, hasAnonKey, hasServiceKey });
    
    if (!hasUrl || !hasAnonKey || !hasServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: { hasUrl, hasAnonKey, hasServiceKey }
      }, { status: 500 });
    }

    // Test 2: Check database connection
    const { data: profiles, error: queryError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .limit(1);

    if (queryError) {
      console.error('❌ Database query failed:', queryError);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: queryError.message
      }, { status: 500 });
    }

    console.log('✅ Database query successful');

    // Test 3: Check auth access
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (authError) {
      console.error('❌ Auth query failed:', authError);
      return NextResponse.json({
        success: false,
        error: 'Cannot access auth.users',
        details: authError.message
      }, { status: 500 });
    }

    console.log('✅ Auth access successful');

    return NextResponse.json({
      success: true,
      message: '✅ Supabase is configured correctly',
      details: {
        databaseConnection: true,
        authAccess: true,
        totalUsers: authData.users.length,
      }
    });
  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}