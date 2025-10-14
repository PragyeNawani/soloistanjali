import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/adminAuth';

export async function GET(request, { params }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    console.log(`📋 Fetching registrations for workshop ID: ${id}`);

    // Get all completed registrations for this workshop
    const { data: registrations, error: regError } = await supabaseAdmin
      .from('workshop_registrations')
      .select('*')
      .eq('workshop_id', id)
      .eq('status', 'completed')
      .order('registered_at', { ascending: false });

    if (regError) {
      console.error('❌ Error fetching registrations:', regError);
      throw regError;
    }

    console.log(`👥 Found ${registrations?.length || 0} registrations`);

    // Fetch user details from auth for each registration
    const registrationsWithUserDetails = await Promise.all(
      registrations.map(async (registration) => {
        try {
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(registration.user_id);
          
          if (authError) {
            console.error(`❌ Error fetching user ${registration.user_id}:`, authError);
            return {
              ...registration,
              email: 'N/A',
              name: 'N/A'
            };
          }
          
          return {
            ...registration,
            email: authUser?.user?.email || 'N/A',
            name: authUser?.user?.user_metadata?.name || 
                  authUser?.user?.user_metadata?.full_name || 
                  authUser?.user?.email?.split('@')[0] || 
                  'N/A'
          };
        } catch (error) {
          console.error(`❌ Exception fetching user ${registration.user_id}:`, error);
          return {
            ...registration,
            email: 'N/A',
            name: 'N/A'
          };
        }
      })
    );

    console.log(`✅ Successfully fetched ${registrationsWithUserDetails.length} registrations with user details`);

    return NextResponse.json({ 
      registrations: registrationsWithUserDetails,
      count: registrationsWithUserDetails.length
    });
  } catch (error) {
    console.error('❌ Error in registrations API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}