import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function verifyAdmin() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

  if (!isAdmin) {
    redirect('/dashboard'); // Regular users go to normal dashboard
  }

  return session.user;
}

export function isAdminEmail(email) {
  return email === process.env.ADMIN_EMAIL;
}