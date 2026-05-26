import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    console.log('=== Signup Request ===');
    console.log('Email:', email);
    console.log('Name:', name);

    // Use service role client for signup to ensure user creation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create user with admin client
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm for testing
      user_metadata: {
        name: name
      }
    });

    if (error) {
      console.error('❌ Signup error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }

    console.log('✅ User created:', data.user.id);

    // Wait a moment for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify profile was created
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('⚠️ Profile not found, creating manually...');
      
      // Manually create profile as fallback
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          name: name
        });
      
      if (insertError) {
        console.error('❌ Manual profile creation failed:', insertError);
      } else {
        console.log('✅ Profile created manually');
      }
    } else {
      console.log('✅ Profile created by trigger');
    }

    return NextResponse.json({
      user: data.user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}