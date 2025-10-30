'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import Image from 'next/image';
import { Lock, AlertCircle } from 'lucide-react';

const REQUIRED_PASSWORD = 'AIFM';

export default function PasswordGatePage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password === REQUIRED_PASSWORD) {
      try {
        const response = await fetch('/api/password-gate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Redirect to home page or intended destination
          const urlParams = new URLSearchParams(window.location.search);
          const callbackUrl = urlParams.get('callbackUrl') || '/';
          window.location.href = callbackUrl; // Use window.location for full page reload to set cookie
        } else {
          setError(data.error || 'Invalid password');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center p-4">
      <Card className="border-2 border-gray-300 bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Image
              src="/dwarf.png"
              alt="AIFM Logo"
              width={80}
              height={80}
              className="rounded-xl"
              unoptimized
            />
          </div>
          <CardTitle className="text-3xl font-bold text-black mb-2 tracking-tight">
            ACCESS REQUIRED
          </CardTitle>
          <p className="text-sm text-gray-600 uppercase tracking-wide">
            Enter password to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black transition-all text-sm uppercase"
                  placeholder="Enter password"
                  autoFocus
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-black text-white hover:bg-gray-800 rounded-2xl uppercase tracking-wide font-semibold py-3 transition-all duration-200"
            >
              {loading ? 'Verifying...' : 'Enter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

