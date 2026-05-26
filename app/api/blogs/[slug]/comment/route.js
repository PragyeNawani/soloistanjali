import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request, { params }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Please login to comment' }, { status: 401 });
    }

    const { slug } = params;
    const { content, parentId } = await request.json();

    console.log('Adding comment to blog:', slug);
    console.log('User:', session.user.email);

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    // Get blog ID
    const { data: blog, error: blogError } = await supabaseAdmin
      .from('blogs')
      .select('id')
      .eq('slug', slug)
      .single();

    if (blogError || !blog) {
      console.error('Blog not found:', blogError);
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    console.log('Blog found, ID:', blog.id);

    // Add comment (without trying to join profiles)
    const { data: comment, error } = await supabaseAdmin
      .from('blog_comments')
      .insert([
        {
          blog_id: blog.id,
          user_id: session.user.id,
          content: content.trim(),
          parent_id: parentId || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Insert comment error:', error);
      throw error;
    }

    console.log('Comment created:', comment.id);

    // Get user profile separately
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, email')
      .eq('id', session.user.id)
      .single();

    // Attach profile to comment
    comment.profiles = profile || {
      name: session.user.user_metadata?.name || 'Anonymous',
      email: session.user.email,
    };

    return NextResponse.json({ comment, message: 'Comment posted successfully' });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post comment' },
      { status: 500 }
    );
  }
}