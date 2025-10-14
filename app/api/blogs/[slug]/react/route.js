import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request, { params }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;
    const { reactionType } = await request.json();

    // Get blog ID
    const { data: blog } = await supabaseAdmin
      .from('blogs')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Check if user already reacted
    const { data: existing } = await supabaseAdmin
      .from('blog_reactions')
      .select('*')
      .eq('blog_id', blog.id)
      .eq('user_id', session.user.id)
      .eq('reaction_type', reactionType)
      .single();

    if (existing) {
      // Remove reaction
      await supabaseAdmin
        .from('blog_reactions')
        .delete()
        .eq('id', existing.id);

      return NextResponse.json({ action: 'removed' });
    } else {
      // Add reaction
      await supabaseAdmin
        .from('blog_reactions')
        .insert([
          {
            blog_id: blog.id,
            user_id: session.user.id,
            reaction_type: reactionType,
          },
        ]);

      return NextResponse.json({ action: 'added' });
    }
  } catch (error) {
    console.error('React error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}