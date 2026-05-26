import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify purchase
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .eq('status', 'completed')
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Course not purchased' },
        { status: 403 }
      );
    }

    // Get course PDF URL from storage
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('pdf_url, title')
      .eq('id', courseId)
      .single();

    if (!course || !course.pdf_url) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    // Generate signed URL for download
    const { data: signedUrl, error: urlError } = await supabaseAdmin.storage
      .from('course-pdfs')
      .createSignedUrl(course.pdf_url, 60); // Valid for 60 seconds

    if (urlError) {
      return NextResponse.json({ error: urlError.message }, { status: 400 });
    }

    return NextResponse.json({
      downloadUrl: signedUrl.signedUrl,
      filename: `${course.title}.pdf`,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    );
  }
}