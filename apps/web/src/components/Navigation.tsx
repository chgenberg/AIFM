'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const userRole = (session.user as any)?.role?.toLowerCase() || 'client';
  
  const dashboardLinks = {
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard' },
    ],
    coordinator: [
      { label: 'Inbox', href: '/coordinator/inbox' },
    ],
    specialist: [
      { label: 'Board', href: '/specialist/board' },
    ],
  };

  const links = dashboardLinks[userRole as keyof typeof dashboardLinks] || [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/dward_favicon.png"
              alt="AIFM Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-lg">AIFM</span>
          </Link>
          
          <div className="flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition ${
                  pathname === link.href
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {session.user?.email}
          </span>
          <span className="text-xs font-semibold bg-gray-200 px-3 py-1 rounded-full">
            {userRole.toUpperCase()}
          </span>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
