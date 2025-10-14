import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/adminAuth';

// PUT update course
export async function PUT(request, { params }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const formData = await request.formData();
    
    const updateData = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: parseInt(formData.get('price')),
      instrument: formData.get('instrument'),
      level: formData.get('level'),
    };

    const pdfFile = formData.get('pdf');

    // Upload new PDF if provided
    if (pdfFile && pdfFile.size > 0) {
      const fileName = `${Date.now()}-${pdfFile.name}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('course-pdfs')
        .upload(fileName, pdfFile);

      if (uploadError) throw uploadError;
      updateData.pdf_url = fileName;
    }

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE course
export async function DELETE(request, { params }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get course to delete PDF
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('pdf_url')
      .eq('id', id)
      .single();

    // Delete PDF from storage if exists
    if (course?.pdf_url) {
      await supabaseAdmin.storage
        .from('course-pdfs')
        .remove([course.pdf_url]);
    }

    // Delete course
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}