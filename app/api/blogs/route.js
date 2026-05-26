import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// GET all blogs
export async function GET(request) {
  try {
    console.log('=== GET /api/blogs started ===');
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');
    
    console.log('Query params:', { status, category });

    // Try blog_stats view first (with proper error handling for RLS issues)
    try {
      let query = supabaseAdmin
        .from('blog_stats')
        .select('*')
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      console.log('Querying blog_stats view...');
      const { data, error } = await query;

      if (error) {
        console.warn('blog_stats query failed:', error.message);
        throw error; // Force fallback
      }

      console.log('blog_stats query successful:', data?.length, 'blogs');
      return NextResponse.json({ blogs: data || [] });
      
    } catch (viewError) {
      console.log('Falling back to direct blogs query...');
      
      // Fallback: Query blogs table directly with manual aggregation
      let query = supabaseAdmin
        .from('blogs')
        .select(`
          *,
          blog_attachments(count),
          blog_comments(count),
          blog_reactions(count)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fallback query failed:', error);
        throw error;
      }

      // Transform the data to match blog_stats format
      const transformedData = data?.map(blog => ({
        ...blog,
        attachment_count: blog.blog_attachments?.[0]?.count || 0,
        comment_count: blog.blog_comments?.[0]?.count || 0,
        reaction_count: blog.blog_reactions?.[0]?.count || 0
      }));

      console.log('Fallback successful:', transformedData?.length, 'blogs');
      return NextResponse.json({ blogs: transformedData || [] });
    }
    
  } catch (error) {
    console.error('=== GET /api/blogs error ===');
    console.error('Error:', error.message);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch blogs',
        details: process.env.NODE_ENV === 'development' ? error.stack : null
      },
      { status: 500 }
    );
  }
}

// POST create blog (admin only)
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const content = formData.get('content');
    const excerpt = formData.get('excerpt');
    const category = formData.get('category');
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags')) : [];
    const status = formData.get('status') || 'draft';
    const featuredImage = formData.get('featuredImage');

    // Generate slug
    const { data: slugData } = await supabaseAdmin.rpc('generate_slug', { title });
    const slug = slugData || title.toLowerCase().replace(/\s+/g, '-');

    let featuredImageUrl = null;

    // Upload featured image if provided
    if (featuredImage && featuredImage.size > 0) {
      const fileName = `${Date.now()}-${featuredImage.name}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('blog-files')
        .upload(fileName, featuredImage);

      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabaseAdmin.storage
        .from('blog-files')
        .getPublicUrl(fileName);
      
      featuredImageUrl = urlData.publicUrl;
    }

    // Insert blog
    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .insert([
        {
          title,
          slug,
          content,
          excerpt,
          category,
          tags,
          status,
          featured_image: featuredImageUrl,
          author_id: session.user.id,
          published_at: status === 'published' ? new Date().toISOString() : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Handle attachments
    const attachments = formData.getAll('attachments');
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        if (file.size > 0) {
          const fileName = `${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('blog-files')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: urlData } = supabaseAdmin.storage
              .from('blog-files')
              .getPublicUrl(fileName);

            await supabaseAdmin.from('blog_attachments').insert([
              {
                blog_id: blog.id,
                file_name: file.name,
                file_url: urlData.publicUrl,
                file_type: file.type.includes('image') ? 'image' : 'pdf',
                file_size: file.size,
              },
            ]);
          }
        }
      }
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Create blog error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}