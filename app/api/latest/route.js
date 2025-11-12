import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch latest published blog
    const { data: latestBlog, error: blogError } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    if (blogError && blogError.code !== 'PGRST116') {
      console.error('Blog fetch error:', blogError);
    }

    // Fetch latest course
    const { data: latestCourse, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (courseError && courseError.code !== 'PGRST116') {
      console.error('Course fetch error:', courseError);
    }

    // Fetch latest upcoming workshop
    const { data: latestWorkshop, error: workshopError } = await supabaseAdmin
      .from('workshops')
      .select('*')
      .eq('status', 'upcoming')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (workshopError && workshopError.code !== 'PGRST116') {
      console.error('Workshop fetch error:', workshopError);
    }
    console.log(latestWorkshop)
    return NextResponse.json({
      blog: latestBlog || null,
      course: latestCourse || null,
      workshop: latestWorkshop || null,
    });
  } catch (error) {
    console.error('Latest items API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}