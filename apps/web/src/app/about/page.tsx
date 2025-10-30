'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import Image from 'next/image';
import { Shield, Zap, BarChart3, TrendingUp, CheckCircle2, Building2 } from 'lucide-react';
import '@/styles/animations.css';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      
      {/* Hero Section with AIFM Logo */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-black mb-4 tracking-tight">
            WHAT WE BUILT
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            AIFM Portal - A comprehensive AI-powered fund management platform transforming how fund accounting teams operate
          </p>
          
          {/* Large Pulsing AIFM Logo */}
          <div className="flex justify-center mb-16">
            <div className="relative group">
              {/* Pulserande ram och skugga */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-3xl blur-xl opacity-50 animate-pulse group-hover:opacity-70 transition-opacity"></div>
              <div className="relative p-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-3xl animate-gradient">
                <div className="bg-white rounded-2xl p-6">
                  <Image
                    src="/AIFM.jpeg"
                    alt="AIFM - AI-Powered Fund Management"
                    width={400}
                    height={160}
                    className="rounded-xl"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.src = '/dwarf.png';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What We Built Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-black mb-8 text-center uppercase tracking-wide">
            Complete Fund Management Solution
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-gray-200 bg-white rounded-3xl hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">AI-Powered Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Intelligent AI that handles bank reconciliation, KYC reviews, and report generation with human-level accuracy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white rounded-3xl hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Real-time VaR calculations, limit breach monitoring, and comprehensive risk analytics for portfolio oversight.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white rounded-3xl hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">Compliance & Governance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automated KYC verification, regulatory deadline tracking, and complete audit trail for compliance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white rounded-3xl hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">Multi-Role Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Seamless coordination between Admin, Coordinator, Specialist, and Client roles with automated handoffs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white rounded-3xl hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">Data Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automated data feeds from Fortnox, Banks, SKV, FI, and Sigma for seamless data ingestion.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white rounded-3xl hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">GDPR Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built with privacy by design. Complete data export, account deletion, and GDPR compliance features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Impact Section */}
        <Card className="border-2 border-gray-200 bg-white rounded-3xl mb-16">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-black mb-4 text-center uppercase tracking-wide">
              Real Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">70%</div>
                <p className="text-gray-600 uppercase tracking-wide text-sm">Time Reduction</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">3x</div>
                <p className="text-gray-600 uppercase tracking-wide text-sm">More Clients</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">80%</div>
                <p className="text-gray-600 uppercase tracking-wide text-sm">Lower Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="border-2 border-gray-200 bg-white rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-black mb-4 text-center uppercase tracking-wide">
              Built With Modern Technology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-bold text-black mb-2 uppercase tracking-wide">Frontend</h4>
                <p className="text-gray-600">Next.js 15, React, TypeScript, Tailwind CSS</p>
              </div>
              <div>
                <h4 className="font-bold text-black mb-2 uppercase tracking-wide">Backend</h4>
                <p className="text-gray-600">Next.js API Routes, Prisma ORM, PostgreSQL</p>
              </div>
              <div>
                <h4 className="font-bold text-black mb-2 uppercase tracking-wide">AI</h4>
                <p className="text-gray-600">OpenAI GPT-5 Mini with custom Knowledge Base</p>
              </div>
              <div>
                <h4 className="font-bold text-black mb-2 uppercase tracking-wide">Security</h4>
                <p className="text-gray-600">NextAuth.js, Role-based access, GDPR compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

