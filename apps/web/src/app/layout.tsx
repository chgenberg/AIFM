import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { ToastContainer } from '@/components/Toast';
import './globals.css';
import '@/styles/animations.css';

export const metadata: Metadata = {
  title: 'AIFM Portal',
  description: 'AI-Powered Fund Management Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}
