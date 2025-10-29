import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { ToastContainer } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIFM Agent Portal',
  description: 'AI-powered fund accounting and reporting',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <ErrorBoundary>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>

          {/* Toast & Notifications */}
          <ToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
