import { redirect } from 'next/navigation';
import { verifyAdmin } from '@/lib/adminAuth';
import BlogForm from '@/components/blog/BlogForm';

export default async function NewBlogPage() {
  await verifyAdmin();
  
  return <BlogForm />;
}