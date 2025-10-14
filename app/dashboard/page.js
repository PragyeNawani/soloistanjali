import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/adminAuth';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // Check if user is admin
  const isAdmin = isAdminEmail(session.user.email);

  // Show admin dashboard or user dashboard based on email
  if (isAdmin) {
    return <AdminDashboard admin={session.user} />;
  }

  return <UserDashboard user={session.user} />;
}