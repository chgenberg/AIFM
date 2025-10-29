'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Laddar...</div>;
  }

  if (!session) {
    router.push('/sign-in');
    return null;
  }

  const userRole = (session.user as any)?.role?.toLowerCase() || 'client';

  const roleConfig = {
    admin: {
      title: 'ADMIN DASHBOARD',
      description: 'Manage system, clients, and configuration',
      href: '/admin/dashboard',
      icon: '⚙️',
    },
    coordinator: {
      title: 'COORDINATOR INBOX',
      description: 'Review and approve pending tasks',
      href: '/coordinator/inbox',
      icon: '✓',
    },
    specialist: {
      title: 'SPECIALIST BOARD',
      description: 'Draft and finalize expert reports',
      href: '/specialist/board',
      icon: '📊',
    },
  };

  const config = roleConfig[userRole as keyof typeof roleConfig] || roleConfig.admin;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/dward_favicon.png"
              alt="AIFM Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="font-bold text-xl">AIFM PORTAL</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <span className="text-xs font-semibold bg-gray-200 px-3 py-1 rounded-full">
              {userRole.toUpperCase()}
            </span>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">{config.icon}</div>
          <h2 className="text-5xl font-bold tracking-tight mb-6">{config.title}</h2>
          <p className="text-xl text-gray-600 mb-10">{config.description}</p>
          <Link href={config.href}>
            <button className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition">
              ENTER DASHBOARD
            </button>
          </Link>
        </div>

        {/* Quick Stats (placeholder) */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-3xl p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-bold text-lg mb-2">TASKS</h3>
            <p className="text-3xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-600 mt-2">Pending</p>
          </div>
          <div className="bg-gray-50 border-2 border-gray-200 rounded-3xl p-8 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="font-bold text-lg mb-2">COMPLETED</h3>
            <p className="text-3xl font-bold text-gray-900">48</p>
            <p className="text-sm text-gray-600 mt-2">This month</p>
          </div>
          <div className="bg-gray-50 border-2 border-gray-200 rounded-3xl p-8 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-lg mb-2">EFFICIENCY</h3>
            <p className="text-3xl font-bold text-gray-900">94%</p>
            <p className="text-sm text-gray-600 mt-2">On target</p>
          </div>
        </div>
      </div>
    </div>
  );
}
