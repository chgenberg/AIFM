'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Laddar...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AIFM Portal</h1>
          <div className="flex gap-4 items-center">
            {session ? (
              <>
                <span className="text-gray-400">{session.user?.email}</span>
                <Button onClick={() => router.push('/dashboard')}>Dashboard</Button>
                <Button 
                  variant="outline" 
                  onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push('/sign-in')}>
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">AI-Powered Fund Management</h2>
          <p className="text-xl text-gray-400 mb-8">
            Automated bank reconciliation, KYC review, and report generation
          </p>
          {!session && (
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => router.push('/sign-in')}>
                Get Started
              </Button>
            </div>
          )}
        </div>

        {session && (
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Link href="/admin/dashboard">
              <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 hover:border-blue-500 transition cursor-pointer">
                <h3 className="text-xl font-bold mb-2">Admin Dashboard</h3>
                <p className="text-gray-400">Manage clients and system settings</p>
              </div>
            </Link>

            <Link href="/coordinator/inbox">
              <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 hover:border-blue-500 transition cursor-pointer">
                <h3 className="text-xl font-bold mb-2">Coordinator</h3>
                <p className="text-gray-400">Review and approve tasks</p>
              </div>
            </Link>

            <Link href="/specialist/board">
              <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 hover:border-blue-500 transition cursor-pointer">
                <h3 className="text-xl font-bold mb-2">Specialist</h3>
                <p className="text-gray-400">Draft and finalize reports</p>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
