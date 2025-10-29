'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-10 text-center space-y-6">
        <h1 className="text-3xl font-bold text-white">Need Access?</h1>
        <p className="text-gray-300 text-lg">
          Demo accounts are already provisioned for this environment. Please use the admin, coordinator,
          or specialist credentials provided in the onboarding guide.
        </p>
        <div className="space-y-2 text-gray-400 font-mono text-sm">
          <p>admin@aifm.com / Password1!</p>
          <p>coordinator@aifm.com / Password1!</p>
          <p>specialist@aifm.com / Password1!</p>
        </div>
        <div className="space-y-4">
          <p className="text-gray-400">
            Need another account for the demo? Reach out to <span className="text-white">demo@aifm.com</span> and we&apos;ll set it up.
          </p>
          <Button onClick={() => window.history.back()} className="w-full">Go Back</Button>
          <Link href="/sign-in" className="block">
            <Button variant="outline" className="w-full">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
