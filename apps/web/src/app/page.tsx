'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { WorkflowModal } from '@/components/WorkflowModal';
import { Card } from '@/components/Card';
import { Lock, BarChart3, Users, ArrowRight, Sparkles, Database, FileCheck } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [showGuide, setShowGuide] = useState(false);
  const isSignedIn = false;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50" />
        
        {/* Floating shapes for visual interest */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-100 rounded-full blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-40">
          <div className="text-center mb-20 animate-fadeInDown">
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-black/5 rounded-full blur-xl scale-150" />
                <Image
                  src="/dwarf.svg"
                  alt="FINANS Logo"
                  width={100}
                  height={100}
                  className="relative w-24 h-24 opacity-90"
                />
              </div>
            </div>
            <h1 className="heading-1 mb-6 text-foreground">
              AIFM AGENT PORTAL
            </h1>
            <p className="subheading mb-4 max-w-3xl mx-auto">
              Revolutionizing fund accounting with AI-powered automation and expert human oversight
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From seamless data integration to polished reports — we've streamlined every step
            </p>
          </div>

          {/* CTA Buttons */}
          {!isSignedIn && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-fadeInUp">
              <Button
                onClick={() => router.push('/sign-in')}
                size="xl"
                className="gap-3 shadow-xl hover:shadow-2xl"
              >
                SIGN IN
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => setShowGuide(true)}
                className="gap-3 border-2"
              >
                SEE HOW IT WORKS
                <Sparkles className="w-5 h-5" />
              </Button>
            </div>
          )}

          {isSignedIn && (
            <div className="flex justify-center mb-20">
              <Button
                onClick={() => setShowGuide(true)}
                size="lg"
                variant="secondary"
                className="gap-3"
              >
                VIEW WALKTHROUGH
                <Sparkles className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
            <Card variant="interactive" className="group animate-fadeIn stagger-1">
              <div className="p-10">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="heading-4 mb-3">INSTANT SYNC</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect Fortnox, banks, and more. Automatic daily synchronization with real-time validation.
                </p>
              </div>
            </Card>

            <Card variant="interactive" className="group animate-fadeIn stagger-2">
              <div className="p-10">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="heading-4 mb-3">AI PROCESSING</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Intelligent reconciliation, pattern analysis, and report generation that learns and improves.
                </p>
              </div>
            </Card>

            <Card variant="interactive" className="group animate-fadeIn stagger-3">
              <div className="p-10">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="heading-4 mb-3">EXPERT REVIEW</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Multi-level quality control with coordinator review and specialist refinement.
                </p>
              </div>
            </Card>

            <Card variant="interactive" className="group animate-fadeIn stagger-4">
              <div className="p-10">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="heading-4 mb-3">ENTERPRISE SECURITY</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bank-grade encryption, role-based access, and comprehensive audit trails.
                </p>
              </div>
            </Card>
          </div>

          {/* How It Works Section */}
          <div className="mb-40">
            <div className="text-center mb-20">
              <h2 className="heading-2 mb-4">HOW IT WORKS</h2>
              <p className="subheading">Three elegant steps to transform your fund accounting</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-xl">
                    1
                  </div>
                </div>
                <h3 className="heading-3 mb-4">CONNECT DATA</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Seamless integration with Fortnox, banks via Nordigen, and manual uploads. Intelligent validation ensures data integrity.
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-xl">
                    2
                  </div>
                </div>
                <h3 className="heading-3 mb-4">AI AUTOMATION</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Advanced AI reconciles transactions, identifies patterns, and generates comprehensive draft reports instantly.
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-xl">
                    3
                  </div>
                </div>
                <h3 className="heading-3 mb-4">DELIVER EXCELLENCE</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Expert review and refinement ensure accuracy. Clients receive polished reports on schedule, every time.
                </p>
              </div>
            </div>
          </div>

          {/* Roles Section */}
          <Card variant="gradient" className="p-16">
            <h2 className="heading-2 mb-16 text-center">UNIFIED WORKFLOW</h2>
            <div className="grid md:grid-cols-4 gap-10">
              <div className="text-center group cursor-pointer">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto transform group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-10 h-10 text-foreground" />
                  </div>
                </div>
                <h3 className="heading-4 mb-3">ADMIN</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Configure integrations, manage access, and monitor system health
                </p>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto transform group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-10 h-10 text-foreground" />
                  </div>
                </div>
                <h3 className="heading-4 mb-3">COORDINATOR</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Review AI outputs, ensure quality, and route tasks efficiently
                </p>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto transform group-hover:scale-110 transition-transform duration-300">
                    <FileCheck className="w-10 h-10 text-foreground" />
                  </div>
                </div>
                <h3 className="heading-4 mb-3">SPECIALIST</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Add expertise, refine insights, and deliver professional reports
                </p>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto transform group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-10 h-10 text-foreground" />
                  </div>
                </div>
                <h3 className="heading-4 mb-3">CLIENT</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Access reports securely and gain actionable financial insights
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Workflow Modal */}
      {showGuide && <WorkflowModal isOpen={showGuide} onClose={() => setShowGuide(false)} />}
    </div>
  );
}
