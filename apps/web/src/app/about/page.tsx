'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { PasswordModal } from '@/components/PasswordModal';
import Image from 'next/image';
import { 
  Shield, Zap, BarChart3, TrendingUp, CheckCircle2, Building2, X, ZoomIn,
  Users, FileText, Database, Globe, Lock, Activity, AlertTriangle, 
  ArrowRight, Settings, ClipboardList, RefreshCw
} from 'lucide-react';
import '@/styles/animations.css';

export default function AboutPage() {
  const [imageZoomed, setImageZoomed] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user has already entered the correct code
    const accessGranted = localStorage.getItem('aifm_access_granted');
    const accessTime = localStorage.getItem('aifm_access_time');
    
    // Check if access was granted within the last 24 hours
    if (accessGranted === 'true' && accessTime) {
      const timeDiff = Date.now() - parseInt(accessTime);
      const hours24 = 24 * 60 * 60 * 1000;
      
      if (timeDiff < hours24) {
        setIsAuthorized(true);
        return;
      } else {
        // Access expired, clear it
        localStorage.removeItem('aifm_access_granted');
        localStorage.removeItem('aifm_access_time');
      }
    }
    
    // Show modal if not authorized
    setShowPasswordModal(true);
  }, []);

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    setIsAuthorized(true);
  };

  // Don't render content until authorized
  if (!isAuthorized) {
    return (
      <PasswordModal isOpen={showPasswordModal} onSuccess={handlePasswordSuccess} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with AIFM Logo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-black mb-4 tracking-tight uppercase">
            WHAT WE BUILT
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            AIFM Portal - A comprehensive AI-powered fund management platform transforming how fund accounting teams operate
          </p>
          
          {/* Large Pulsing AIFM Logo */}
          <div className="flex justify-center mb-16">
            <div 
              className="relative group cursor-pointer"
              onClick={() => setImageZoomed(true)}
            >
              {/* Pulserande ram och skugga */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-3xl blur-xl opacity-50 animate-pulse group-hover:opacity-70 transition-opacity"></div>
              <div className="relative p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-3xl animate-gradient">
                <div className="bg-white rounded-2xl p-10 relative">
                  <Image
                    src="/AIFM.jpeg"
                    alt="AIFM - AI-Powered Fund Management"
                    width={800}
                    height={320}
                    className="rounded-xl"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.src = '/dwarf.png';
                    }}
                  />
                  {/* Zoom indicator */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zoom Modal */}
        {imageZoomed && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setImageZoomed(false)}
          >
            <div className="relative max-w-7xl w-full max-h-[90vh] flex items-center justify-center">
              {/* Close button */}
              <button
                onClick={() => setImageZoomed(false)}
                className="absolute top-4 right-4 bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-all z-10 shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Zoomed image */}
              <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <div className="relative p-6 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-3xl animate-gradient">
                  <div className="bg-white rounded-2xl p-8">
                    <Image
                      src="/AIFM.jpeg"
                      alt="AIFM - AI-Powered Fund Management"
                      width={1600}
                      height={640}
                      className="rounded-xl max-w-full max-h-[85vh] object-contain"
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
        )}

        {/* Core Features Section */}
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
                  <Users className="w-8 h-8 text-blue-900" />
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
                  <Database className="w-8 h-8 text-blue-900" />
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
                  <Activity className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">Real-time Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Instant document analysis, compliance verification, and live status updates across all workflows.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white rounded-3xl hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">Document Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Intelligent document indexing, search, and compliance checking with AI-powered analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white rounded-3xl hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">Automated Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Streamlined task routing, automated assignments, and intelligent prioritization for efficiency.
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

        {/* Key Capabilities Section */}
        <Card className="border-2 border-gray-200 bg-white rounded-3xl mb-16">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-black mb-6 text-center uppercase tracking-wide">
              Key Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1 uppercase tracking-wide">Task Management</h4>
                    <p className="text-gray-600 text-sm">
                      Automated task creation, assignment, and tracking across all roles with intelligent prioritization.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1 uppercase tracking-wide">Risk Monitoring</h4>
                    <p className="text-gray-600 text-sm">
                      Continuous risk assessment with VaR calculations, limit breach alerts, and stress testing.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1 uppercase tracking-wide">External Integrations</h4>
                    <p className="text-gray-600 text-sm">
                      Connect with Fortnox, banking APIs, SKV, FI, and Sigma for automated data synchronization.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1 uppercase tracking-wide">Security & Access</h4>
                    <p className="text-gray-600 text-sm">
                      Role-based access control, audit logging, and secure authentication with NextAuth.js.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Settings className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1 uppercase tracking-wide">Policy Management</h4>
                    <p className="text-gray-600 text-sm">
                      Define and enforce compliance policies, regulations, and automated checking rules.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1 uppercase tracking-wide">Analytics & Reporting</h4>
                    <p className="text-gray-600 text-sm">
                      Comprehensive dashboards, real-time statistics, and automated report generation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

