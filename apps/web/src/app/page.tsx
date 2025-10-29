'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/Button';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/dwarf.png"
              alt="AIFM Logo"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <h1 className="text-2xl font-bold tracking-tight">AIFM PORTAL</h1>
          </div>
          <div className="flex gap-4 items-center">
            {session ? (
              <>
                <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
                  HOW IT WORKS
                </Link>
                <span className="text-sm text-gray-600">{session.user?.email}</span>
                <Button onClick={() => router.push('/dashboard')} size="sm">
                  DASHBOARD
                </Button>
                <Button 
                  variant="minimal" 
                  size="sm"
                  onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                >
                  SIGN OUT
                </Button>
              </>
            ) : (
              <>
                <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
                  HOW IT WORKS
                </Link>
                <Button variant="minimal" size="sm" onClick={() => router.push('/sign-in')}>
                  SIGN IN
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/dwarf.png"
              alt="AIFM Logo"
              width={100}
              height={100}
              className="rounded-3xl shadow-lg"
            />
          </div>
          <h2 className="text-6xl font-bold tracking-tighter mb-6">AI-POWERED FUND MANAGEMENT</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Automated bank reconciliation, KYC review, and intelligent report generation powered by AI
          </p>
          {!session && (
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => router.push('/sign-in')}>
                GET STARTED
              </Button>
            </div>
          )}
        </div>

        {/* Role Cards */}
        {session && (
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Link href="/admin/dashboard">
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-gray-400 hover:shadow-lg transition-all cursor-pointer group">
                <div className="mb-4 text-3xl">⚙️</div>
                <h3 className="text-2xl font-bold mb-3 uppercase tracking-wide">ADMIN</h3>
                <p className="text-gray-600">Manage clients and system configuration</p>
                <div className="mt-6 inline-flex items-center text-sm font-semibold group-hover:translate-x-1 transition">
                  Explore →
                </div>
              </div>
            </Link>

            <Link href="/coordinator/inbox">
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-gray-400 hover:shadow-lg transition-all cursor-pointer group">
                <div className="mb-4 text-3xl">✓</div>
                <h3 className="text-2xl font-bold mb-3 uppercase tracking-wide">COORDINATOR</h3>
                <p className="text-gray-600">Review and approve pending tasks</p>
                <div className="mt-6 inline-flex items-center text-sm font-semibold group-hover:translate-x-1 transition">
                  Explore →
                </div>
              </div>
            </Link>

            <Link href="/specialist/board">
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-gray-400 hover:shadow-lg transition-all cursor-pointer group">
                <div className="mb-4 text-3xl">📊</div>
                <h3 className="text-2xl font-bold mb-3 uppercase tracking-wide">SPECIALIST</h3>
                <p className="text-gray-600">Draft and finalize expert reports</p>
                <div className="mt-6 inline-flex items-center text-sm font-semibold group-hover:translate-x-1 transition">
                  Explore →
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Features Section */}
        {!session && (
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🏦</div>
              <h4 className="text-lg font-bold mb-2 uppercase">BANK RECONCILIATION</h4>
              <p className="text-gray-600">Automated matching and variance analysis</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h4 className="text-lg font-bold mb-2 uppercase">KYC COMPLIANCE</h4>
              <p className="text-gray-600">Intelligent investor verification</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h4 className="text-lg font-bold mb-2 uppercase">SMART REPORTS</h4>
              <p className="text-gray-600">AI-generated fund accounting reports</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-24 py-8 text-center text-gray-600 text-sm">
        <p>AIFM Portal © 2024 | AI-Powered Fund Management</p>
      </footer>
    </div>
  );
}
