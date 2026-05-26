import { redirect } from 'next/navigation';
import { verifyAdmin } from '@/lib/adminAuth';
import BlogForm from '@/components/blog/BlogForm';
import { supabaseAdmin } from '@/lib/supabase';

export default async function EditBlogPage({ params }) {
  await verifyAdmin();
  
  const { data: blog } = await supabaseAdmin
    .from('blogs')
    .select('*')
    .eq('slug', params.slug)
    .single();
  
  if (!blog) {
    redirect('/dashboard');
  }
  
  return <BlogForm blog={blog} />;
}