'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './Button';
import Image from 'next/image';
import {
  Home,
  CheckCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: Home, roles: ['admin', 'coordinator', 'specialist', 'client'] },
  { href: '/coordinator/inbox', label: 'QC Inbox', icon: CheckCircle, roles: ['admin', 'coordinator'] },
  { href: '/specialist/board', label: 'Delivery Board', icon: BarChart3, roles: ['admin', 'specialist'] },
  { href: '/client/dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'client'] },
  { href: '/admin/dashboard', label: 'Admin', icon: Settings, roles: ['admin'] },
];

export const Navigation = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const userRole = 'admin';
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-full px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Image
              src="/dwarf.svg"
              alt="FINANS Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="hidden sm:inline">FINANS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Desktop User Info */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div>
                <p className="font-medium">Test User</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
            </div>

            {/* Desktop Logout */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={() => window.location.href = '/'}
            >
              <LogOut className="w-4 h-4" />
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                      ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              <p className="text-sm font-medium px-3">Test User</p>
              <p className="text-xs text-gray-500 px-3">{userRole}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.location.href = '/'}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
