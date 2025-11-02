'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/Button';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const userRole = session ? ((session.user as any)?.role?.toLowerCase() || 'client') : null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={session ? "/dashboard" : "/"} className="flex items-center">
              <Image
                src="/dwarf.png"
                alt="AIFM"
                width={40}
                height={40}
                className="rounded-lg"
                unoptimized
              />
              <span className="ml-3 text-lg font-semibold text-gray-900 uppercase tracking-wide">AIFM Portal</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session.user?.email}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{userRole}</p>
                </div>
                <button
                  onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wide bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/how-it-works" 
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  HOW IT WORKS
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/sign-in')}
                  className="text-xs font-medium uppercase tracking-wide"
                >
                  SIGN IN
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}