import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import CookieConsent from '@/components/layout/CookieConsent';
import PageTransition from '@/components/layout/PageTransition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'IdeaForge — Student Innovation & Talent Discovery', template: '%s | IdeaForge' },
  description: 'IdeaForge is where engineering students showcase hackathon projects and ideathon ideas, and where recruiters find the builders they need.',
  keywords: ['hackathon projects', 'student portfolio', 'ideathon', 'tech talent', 'student showcase'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'IdeaForge',
    title: 'IdeaForge — Student Innovation & Talent Discovery',
    description: 'Engineering students post what they built. Recruiters find who built it.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <PageTransition />
            {children}
            <CookieConsent />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
