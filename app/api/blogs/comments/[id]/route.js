import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function DELETE(request, { params }) {
  try {
    const commentId = params.id;
    console.log('Delete comment request:', commentId);

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User:', session.user.email);

    // Get the comment to check ownership
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('blog_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      console.error('Comment not found:', fetchError);
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user is admin or comment owner
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;
    const isOwner = comment.user_id === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    console.log('Permission granted:', isAdmin ? 'Admin' : 'Owner');

    // Delete the comment
    const { error: deleteError } = await supabaseAdmin
      .from('blog_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw deleteError;
    }

    console.log('Comment deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: 500 }
    );
  }
}