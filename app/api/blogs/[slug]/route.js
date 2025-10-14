import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers'; // Add this import
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// GET single blog
export async function GET(request, { params }) {
  try {
    console.log('API: Fetching blog with slug:', params.slug);

    // Get blog with attachments
    const { data: blog, error: blogError } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single();

    if (blogError) {
      console.error('Blog fetch error:', blogError);
      return NextResponse.json(
        { error: 'Blog not found', details: blogError.message },
        { status: 404 }
      );
    }

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    console.log('Blog found:', blog.title);

    // Get attachments separately
    const { data: attachments } = await supabaseAdmin
      .from('blog_attachments')
      .select('*')
      .eq('blog_id', blog.id);

    blog.blog_attachments = attachments || [];

    // Increment views (don't wait for it)
    supabaseAdmin
      .from('blogs')
      .update({ views: (blog.views || 0) + 1 })
      .eq('id', blog.id)
      .then(() => console.log('Views incremented'))
      .catch(err => console.error('View increment error:', err));

    // Get reaction counts
    const { data: reactionData, error: reactionError } = await supabaseAdmin
      .from('blog_reactions')
      .select('reaction_type')
      .eq('blog_id', blog.id);

    if (reactionError) {
      console.error('Reaction fetch error:', reactionError);
    }

    // Count reactions manually
    const reactions = {};
    if (reactionData && Array.isArray(reactionData)) {
      reactionData.forEach(r => {
        reactions[r.reaction_type] = (reactions[r.reaction_type] || 0) + 1;
      });
    }

    // Convert to array format
    const reactionsArray = Object.entries(reactions).map(([type, count]) => ({
      reaction_type: type,
      count: count
    }));

    console.log('Reactions:', reactionsArray);

    // // Get comments with user info
    // const { data: comments, error: commentsError } = await supabaseAdmin
    //   .from('blog_comments')
    //   .select('*')
    //   .eq('blog_id', blog.id)
    //   .order('created_at', { ascending: false });

    // if (commentsError) {
    //   console.error('Comments fetch error:', commentsError);
    // }
    // Get comments (without join)
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('blog_comments')
      .select('*')
      .eq('blog_id', blog.id)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Comments fetch error:', commentsError);
    }

    // // Get user profiles for comments
    // if (comments && comments.length > 0) {
    //   const userIds = [...new Set(comments.map(c => c.user_id))];
    //   const { data: profiles } = await supabaseAdmin
    //     .from('profiles')
    //     .select('id, name, email')
    //     .in('id', userIds);

    //   // Attach profile to each comment
    //   comments.forEach(comment => {
    //     comment.profiles = profiles?.find(p => p.id === comment.user_id) || {
    //       name: 'Anonymous',
    //       email: ''
    //     };
    //   });
    // }
    // Get user profiles for comments separately
    if (comments && comments.length > 0) {
      const userIds = [...new Set(comments.map(c => c.user_id))];

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      // Attach profile to each comment
      comments.forEach(comment => {
        const userProfile = profiles?.find(p => p.id === comment.user_id);
        comment.profiles = userProfile || {
          name: 'Anonymous',
          email: '',
        };
      });
    }
    
    console.log('Comments count:', comments?.length || 0);

    return NextResponse.json({
      blog,
      reactions: reactionsArray,
      comments: comments || [],
    });
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT update blog (admin only) - FIXED VERSION
export async function PUT(request, { params }) {
  try {
    console.log('=== PUT Request Started ===');
    console.log('Slug:', params.slug);

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('No session found');
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 });
    }

    if (session.user.email !== process.env.ADMIN_EMAIL) {
      console.error('Not admin:', session.user.email);
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    console.log('Admin verified:', session.user.email);

    const { slug } = params;
    
    // First, check if blog exists
    const { data: existingBlog, error: checkError } = await supabaseAdmin
      .from('blogs')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle(); // Use maybeSingle instead of single
    
    if (checkError) {
      console.error('Check error:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (!existingBlog) {
      console.error('Blog not found with slug:', slug);
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    console.log('Existing blog found:', existingBlog.id);

    // Get update data
    const contentType = request.headers.get('content-type');
    let updateData = {};

    if (contentType && contentType.includes('application/json')) {
      // JSON update
      updateData = await request.json();
      console.log('JSON update data:', Object.keys(updateData));
    } else {
      // FormData update
      const formData = await request.formData();
      
      updateData = {
        title: formData.get('title'),
        content: formData.get('content'),
        excerpt: formData.get('excerpt'),
        category: formData.get('category'),
        status: formData.get('status') || 'draft',
        updated_at: new Date().toISOString(),
      };

      // Parse tags
      const tagsString = formData.get('tags');
      if (tagsString) {
        try {
          updateData.tags = JSON.parse(tagsString);
        } catch (e) {
          updateData.tags = tagsString.split(',').map(t => t.trim()).filter(t => t);
        }
      }

      console.log('FormData update:', Object.keys(updateData));

      // Handle featured image upload
      const featuredImage = formData.get('featuredImage');
      if (featuredImage && featuredImage.size > 0) {
        console.log('Uploading new featured image:', featuredImage.name);
        const fileName = `${Date.now()}-${featuredImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('blog-files')
          .upload(fileName, featuredImage);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
        } else {
          const { data: urlData } = supabaseAdmin.storage
            .from('blog-files')
            .getPublicUrl(fileName);
          
          updateData.featured_image = urlData.publicUrl;
          console.log('Featured image uploaded:', fileName);
        }
      }

      // Handle new attachments
      const attachments = formData.getAll('attachments');
      if (attachments && attachments.length > 0) {
        console.log('Processing attachments:', attachments.length);
        
        for (const file of attachments) {
          if (file && file.size > 0) {
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            
            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
              .from('blog-files')
              .upload(fileName, file);

            if (!uploadError) {
              const { data: urlData } = supabaseAdmin.storage
                .from('blog-files')
                .getPublicUrl(fileName);

              await supabaseAdmin.from('blog_attachments').insert([
                {
                  blog_id: existingBlog.id,
                  file_name: file.name,
                  file_url: urlData.publicUrl,
                  file_type: file.type.includes('image') ? 'image' : 'pdf',
                  file_size: file.size,
                },
              ]);
              
              console.log('Attachment uploaded:', fileName);
            }
          }
        }
      }
    }

    // Set published_at if changing to published
    if (updateData.status === 'published' && existingBlog.status !== 'published') {
      updateData.published_at = new Date().toISOString();
    }

    console.log('Updating blog with data:', Object.keys(updateData));

    // Update the blog - use the ID instead of slug for reliability
    const { data: updatedBlog, error: updateError } = await supabaseAdmin
      .from('blogs')
      .update(updateData)
      .eq('id', existingBlog.id) // Use ID instead of slug
      .select();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updatedBlog || updatedBlog.length === 0) {
      console.error('No blog returned after update');
      return NextResponse.json({ error: 'Update failed - no data returned' }, { status: 500 });
    }

    console.log('Blog updated successfully');

    return NextResponse.json({ 
      blog: updatedBlog[0], // Return first item from array
      message: 'Blog updated successfully' 
    });
  } catch (error) {
    console.error('=== PUT Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE blog (admin only)
export async function DELETE(request, { params }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;

    // Get blog first to get ID for deleting attachments
    const { data: blog } = await supabaseAdmin
      .from('blogs')
      .select('id, featured_image')
      .eq('slug', slug)
      .single();

    if (blog) {
      // Delete attachments from storage
      const { data: attachments } = await supabaseAdmin
        .from('blog_attachments')
        .select('file_url')
        .eq('blog_id', blog.id);

      if (attachments) {
        for (const attachment of attachments) {
          const fileName = attachment.file_url.split('/').pop();
          await supabaseAdmin.storage
            .from('blog-files')
            .remove([fileName]);
        }
      }

      // Delete featured image from storage
      if (blog.featured_image) {
        const fileName = blog.featured_image.split('/').pop();
        await supabaseAdmin.storage
          .from('blog-files')
          .remove([fileName]);
      }
    }

    // Delete blog (cascade will delete attachments, reactions, comments)
    const { error } = await supabaseAdmin
      .from('blogs')
      .delete()
      .eq('slug', slug);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}