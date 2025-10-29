'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Building2, 
  TrendingUp, 
  FileCheck, 
  CheckCircle2, 
  FileText, 
  Shield,
  Zap,
  Users,
  ArrowRight
} from 'lucide-react';

export default function HowItWorksPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role?.toLowerCase() || 'client';

  const workflows = [
    {
      title: '1. DATA INGESTION',
      description: 'Bank statements, ledger entries, and investor data are automatically imported',
      icon: Building2,
      color: 'blue',
    },
    {
      title: '2. AI PROCESSING',
      description: 'AI analyzes data for reconciliation, KYC checks, and generates draft reports',
      icon: Zap,
      color: 'purple',
    },
    {
      title: '3. QUALITY CONTROL',
      description: 'Coordinator reviews flagged items and approves or rejects',
      icon: FileCheck,
      color: 'orange',
    },
    {
      title: '4. EXPERT REVIEW',
      description: 'Specialist finalizes reports and ensures compliance',
      icon: FileText,
      color: 'green',
    },
    {
      title: '5. DELIVERY',
      description: 'Approved reports are published and delivered to clients',
      icon: CheckCircle2,
      color: 'gray',
    },
  ];

  const roleWorkflows = {
    admin: {
      title: 'ADMIN DASHBOARD',
      description: 'Monitor system health, manage clients, and oversee operations',
      steps: [
        'View system statistics (clients, tasks, reports)',
        'Monitor task status breakdown',
        'Track report status across all stages',
        'Manage user accounts and permissions',
      ],
      link: '/admin/dashboard',
    },
    coordinator: {
      title: 'COORDINATOR INBOX',
      description: 'Review and approve tasks that need quality control',
      steps: [
        'View all pending tasks requiring review',
        'Check flags and discrepancies',
        'Approve tasks that pass QC',
        'Reject tasks that need correction',
      ],
      link: '/coordinator/inbox',
    },
    specialist: {
      title: 'SPECIALIST BOARD',
      description: 'Manage reports through the approval workflow',
      steps: [
        'View reports in different stages (DRAFT, QC, APPROVAL, PUBLISHED)',
        'Edit report drafts',
        'Move reports to next stage',
        'Finalize and publish reports',
      ],
      link: '/specialist/board',
    },
  };

  const currentRole = roleWorkflows[userRole as keyof typeof roleWorkflows] || roleWorkflows.admin;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="font-bold text-2xl">HOW IT WORKS</h1>
          <p className="text-gray-600 mt-2">Understanding the AIFM workflow</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Your Role Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">YOUR ROLE: {currentRole.title}</h2>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{currentRole.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {currentRole.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href={currentRole.link}>
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complete Workflow */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">COMPLETE WORKFLOW</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {workflows.map((workflow, idx) => {
              const Icon = workflow.icon;
              return (
                <div key={idx} className="relative">
                  <Card className="h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-${workflow.color}-100 flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 text-${workflow.color}-600`} />
                      </div>
                      <CardTitle className="text-sm font-bold">{workflow.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs">{workflow.description}</CardDescription>
                    </CardContent>
                  </Card>
                  {idx < workflows.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">TASK TYPES</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  BANK RECONCILIATION
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  AI compares bank statements with ledger entries, identifies discrepancies, and flags variances for review.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                  KYC REVIEW
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  AI verifies investor identity, checks PEP status, sanctions lists, and UBO structures.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-green-600" />
                  REPORT DRAFT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  AI generates professional fund accounting reports with performance metrics and compliance notes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Demo Credentials */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>DEMO CREDENTIALS</CardTitle>
            <CardDescription>Use these accounts to explore different roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Admin</p>
                <p className="text-gray-600">admin@aifm.com</p>
                <p className="text-gray-600">Password1!</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Coordinator</p>
                <p className="text-gray-600">coordinator@aifm.com</p>
                <p className="text-gray-600">Password1!</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Specialist</p>
                <p className="text-gray-600">specialist@aifm.com</p>
                <p className="text-gray-600">Password1!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

