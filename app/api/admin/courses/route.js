import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/adminAuth';

// GET all courses
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new course
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const price = parseInt(formData.get('price'));
    const instrument = formData.get('instrument');
    const level = formData.get('level');
    const pdfFile = formData.get('pdf');

    let pdfUrl = null;

    // Upload PDF if provided
    if (pdfFile) {
      const fileName = `${Date.now()}-${pdfFile.name}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('course-pdfs')
        .upload(fileName, pdfFile);

      if (uploadError) throw uploadError;
      pdfUrl = fileName;
    }

    // Insert course
    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert([
        {
          title,
          description,
          price,
          instrument,
          level,
          pdf_url: pdfUrl,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}