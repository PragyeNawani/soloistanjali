import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/adminAuth';

// GET all workshops
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: workshops, error } = await supabaseAdmin
      .from('workshops')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ workshops });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new workshop
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data: workshop, error } = await supabaseAdmin
      .from('workshops')
      .insert([
        {
          title: body.title,
          description: body.description,
          instructor: body.instructor,
          date: body.date,
          duration: body.duration,
          price: body.price,
          max_participants: body.max_participants,
          workshop_link: body.workshop_link,
          status: 'upcoming',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Store email template
    if (body.email_subject && body.email_message) {
      await supabaseAdmin
        .from('workshop_email_templates')
        .insert([
          {
            workshop_id: workshop.id,
            subject: body.email_subject,
            message: body.email_message,
          },
        ]);
    }

    return NextResponse.json({ workshop });
  } catch (error) {
    console.error('Error creating workshop:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}