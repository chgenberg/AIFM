'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  const userRole = (session.user as any)?.role?.toLowerCase() || 'client';

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/dwarf.png"
              alt="AIFM Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="font-bold text-xl">AIFM PORTAL</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session.user?.email}</span>
          <span className="text-xs font-semibold bg-gray-200 px-3 py-1 rounded-full uppercase tracking-wide">
            {userRole}
          </span>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition uppercase tracking-wide"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

