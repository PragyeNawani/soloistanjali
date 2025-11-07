import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
const inter = Inter({ subsets: ['latin'] });
import { NavProvider } from '@/Context/context';

export const metadata = {
  title: 'SOLOISTANJALI',
  description: 'Professional music lessons for guitar, piano, cello, and more',
};

export default async function RootLayout({ children }) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <NavProvider>
          <Navigation user={session?.user || null} />
          {children}
          <Footer />
        </NavProvider>
      </body>
    </html>
  );
}