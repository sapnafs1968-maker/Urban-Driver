import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { DemoBar } from '@/components/layout/DemoBar';
import { SeniorAccessibilityBar } from '@/components/senior/SeniorAccessibilityBar';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Urban Driver | Your Car. Your Trusted Driver. Your Family’s Peace of Mind.',
  description:
    'Senior-friendly, family-connected professional driver booking platform for personal vehicles. Verified drivers, trusted driver circle, arrival confirmation, and remote family guardian oversight.',
  keywords: [
    'Urban Driver',
    'hire driver for own car',
    'senior citizen driver',
    'family guardian mobility',
    'verified drivers Bangalore',
    'elderly hospital driver',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-teal selection:text-white">
        <AppProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <SeniorAccessibilityBar />
            <main className="flex-1 pb-16">{children}</main>
            <DemoBar />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
