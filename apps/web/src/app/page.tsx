'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/Card';
import { 
  BarChart3, TrendingUp, 
  Shield, Zap, Users, FileText, ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  const features = [
    {
      icon: BarChart3,
      title: 'AI-Powered Analysis',
      description: 'Automated reconciliation and intelligent report generation'
    },
    {
      icon: Shield,
      title: 'Regulatory Compliance',
      description: 'Stay compliant with automated checks and real-time monitoring'
    },
    {
      icon: Users,
      title: 'Multi-Role Platform',
      description: 'Tailored interfaces for coordinators, specialists, and clients'
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Instant document analysis and compliance verification'
    },
  ];

  const roleCards = [
    {
      role: 'COORDINATOR',
      title: 'Coordinator Dashboard',
      description: 'Manage tasks and oversee the entire workflow',
      icon: Users,
      href: '/coordinator/inbox',
      color: 'border-blue-200 hover:border-blue-400'
    },
    {
      role: 'SPECIALIST',
      title: 'Specialist Workspace',
      description: 'Review reports and complete specialized tasks',
      icon: FileText,
      href: '/specialist/board',
      color: 'border-green-200 hover:border-green-400'
    },
    {
      role: 'ADMIN',
      title: 'Admin Panel',
      description: 'System configuration and monitoring',
      icon: Shield,
      href: '/admin/dashboard',
      color: 'border-purple-200 hover:border-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-2xl opacity-20"></div>
                <Image
                  src="/AIFM.jpeg"
                  alt="AIFM"
                  width={200}
                  height={80}
                  className="relative rounded-2xl shadow-lg"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.src = '/dwarf.png';
                  }}
                />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              AI-POWERED FUND MANAGEMENT
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Automated bank reconciliation, KYC review, and intelligent report generation 
              powered by advanced AI technology
            </p>
            {!session && (
              <div className="flex justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => router.push('/sign-in')}
                  className="uppercase tracking-wide"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => router.push('/how-it-works')}
                  className="uppercase tracking-wide"
                >
                  Learn More
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {!session && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                POWERFUL FEATURES
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage fund accounting efficiently
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border border-gray-200 hover:border-gray-400 transition-all duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Role Selection for Logged In Users */}
      {session && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                WELCOME BACK
              </h2>
              <p className="text-lg text-gray-600">
                Select your workspace to continue
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {roleCards.map((card) => {
                const userRole = (session.user as any)?.role;
                const isAccessible = userRole === card.role || userRole === 'ADMIN';
                
                return (
                  <Link 
                    key={card.role} 
                    href={isAccessible ? card.href : '#'}
                    className={!isAccessible ? 'pointer-events-none' : ''}
                  >
                    <Card className={`
                      h-full border-2 transition-all duration-200 
                      ${isAccessible 
                        ? `${card.color} cursor-pointer hover:shadow-lg` 
                        : 'border-gray-100 opacity-50'
                      }
                    `}>
                      <CardContent className="p-6 text-center">
                        <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                          ${isAccessible ? 'bg-gray-100' : 'bg-gray-50'}
                        `}>
                          <card.icon className={`
                            w-8 h-8 
                            ${isAccessible ? 'text-gray-700' : 'text-gray-400'}
                          `} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {card.description}
                        </p>
                        {isAccessible ? (
                          <span className="text-sm font-medium text-gray-900 flex items-center justify-center gap-1">
                            Enter
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Not available for your role
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!session && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              READY TO GET STARTED?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join leading fund managers who are already using AIFM Portal 
              to streamline their operations
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push('/sign-in')}
              className="uppercase tracking-wide"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}