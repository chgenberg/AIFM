'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 mt-24 py-8 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">AIFM Portal</h3>
            <p className="text-sm text-gray-600">
              AI-Powered Fund Management Platform
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/data-protection" className="text-gray-600 hover:text-gray-900 transition">
                  Data Protection
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-gray-900 transition">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 transition">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="mailto:privacy@aifm.com" className="hover:text-gray-900 transition">
                  privacy@aifm.com
                </a>
              </li>
              <li>
                <a href="mailto:dpo@aifm.com" className="hover:text-gray-900 transition">
                  dpo@aifm.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* AIFM Image */}
        <div className="border-t border-gray-200 pt-8 pb-4">
          <div className="flex justify-center">
            <Link href="/" className="block group">
              <div className="relative">
                {/* Pulserande ram och skugga */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl blur-md opacity-50 animate-pulse group-hover:opacity-70 transition-opacity"></div>
                <div className="relative p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl">
                  <div className="bg-white rounded-xl p-2">
                    <Image
                      src="/AIFM.jpeg"
                      alt="AIFM - AI-Powered Fund Management"
                      width={200}
                      height={80}
                      className="rounded-lg"
                      unoptimized
                      onError={(e) => {
                        // Fallback om bilden inte finns
                        e.currentTarget.src = '/dwarf.png';
                      }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 text-center text-sm text-gray-600">
          <p>AIFM Portal © {currentYear} | AI-Powered Fund Management</p>
        </div>
      </div>
    </footer>
  );
}

