import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch latest PUBLISHED blog (ordered by published_at, not created_at)
    const { data: latestBlog, error: blogError } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .not('published_at', 'is', null) // Ensure published_at is not null
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data

    if (blogError && blogError.code !== 'PGRST116') {
      console.error('Blog fetch error:', blogError);
    }

    // Fetch latest course
    const { data: latestCourse, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (courseError && courseError.code !== 'PGRST116') {
      console.error('Course fetch error:', courseError);
    }

    // Fetch NEAREST upcoming workshop (by date, not created_at)
    const now = new Date().toISOString();
    const { data: latestWorkshop, error: workshopError } = await supabaseAdmin
      .from('workshops')
      .select('*')
      .eq('status', 'upcoming')
      .gte('date', now) // Only get future workshops
      .order('date', { ascending: true }) // Ascending = nearest first
      .limit(1)
      .maybeSingle();

    if (workshopError && workshopError.code !== 'PGRST116') {
      console.error('Workshop fetch error:', workshopError);
    }
    
    console.log('Fetched items:', {
      blog: latestBlog ? latestBlog.title : 'none',
      course: latestCourse ? latestCourse.title : 'none',
      workshop: latestWorkshop ? latestWorkshop.title : 'none'
    });

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