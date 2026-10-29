import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MotionProvider } from '@/components/providers/MotionProvider';
import { ToastViewport } from '@/components/ui/ToastViewport';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'mobileDrive — Configure. Experience. Drive.',
    template: '%s — mobileDrive',
  },
  description:
    'A premium interactive 3D automotive marketplace. Explore, configure and experience your next vehicle.',
  metadataBase: new URL('https://mobiledrive.local'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    // iOS strictly needs a PNG at /apple-touch-icon.png for add-to-home-screen
    // to show the brand mark instead of a generated letter.
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'mobileDrive — Configure. Experience. Drive.',
    description: 'A premium interactive 3D automotive marketplace.',
    siteName: 'mobileDrive',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mobileDrive',
    description: 'A premium interactive 3D automotive marketplace.',
  },
};

export const viewport: Viewport = {
  themeColor: '#07080A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen bg-ink-900 font-sans text-ink-50 antialiased">
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-full focus-visible:bg-white focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-ink-900"
        >
          Skip to main content
        </a>
        <MotionProvider>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <ToastViewport />
        </MotionProvider>
      </body>
    </html>
  );
}
