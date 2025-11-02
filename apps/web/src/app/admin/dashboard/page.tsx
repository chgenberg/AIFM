'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import { Header } from '@/components/Header';
import { 
  RefreshCw, Users, FileText, BarChart3, Activity, MessageSquare, 
  Shield, TrendingDown, FolderOpen, Database, Link2, AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';
import { DocumentStatsChart, ComplianceScoreChart } from '@/components/Charts';

interface HealthData {
  clients: number;
  tasks: number;
  reports: number;
  investors: number;
  documents: number;
  policies: number;
  regulations: number;
  taskStats: Record<string, number>;
  reportStats: Record<string, number>;
  documentStats: Record<string, number>;
  complianceStats: {
    total: number;
    compliant: number;
    nonCompliant: number;
    needsReview: number;
    score: number;
  };
  recentDocuments: Array<{
    id: string;
    fileName: string;
    title: string | null;
    status: string;
    uploadedAt: string;
    client?: { id: string; name: string } | null;
  }>;
}

type DashboardTab = 'OVERVIEW' | 'TASKS' | 'REPORTS';

export default function AdminDashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to load stats');
      }
      const data = await response.json();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!health) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading system status...</div>
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'SYSTEM ACTIVITY',
      description: 'Live monitoring of workflow',
      href: '/admin/activity',
      icon: Activity,
    },
    {
      title: 'AI ASSISTANT',
      description: 'Chat with AI about your system',
      href: '/admin/ai-chat',
      icon: MessageSquare,
    },
    {
      title: 'DATA FEEDS',
      description: 'Configure Fortnox & Bank APIs',
      href: '/admin/datafeeds',
      icon: Database,
    },
    {
      title: 'RISK MANAGEMENT',
      description: 'Monitor portfolio risks',
      href: '/admin/risk-management',
      icon: TrendingDown,
    },
    {
      title: 'COMPLIANCE',
      description: 'Regulatory compliance',
      href: '/admin/compliance',
      icon: Shield,
    },
  ];

  const bottomActions = [
    {
      title: 'POLICIES',
      description: 'Manage compliance policies',
      href: '/admin/policies',
      icon: Shield,
    },
    {
      title: 'DOCUMENTS',
      description: 'Upload & manage files',
      href: '/admin/documents',
      icon: FolderOpen,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ADMIN DASHBOARD</h1>
            <p className="text-sm text-gray-600 uppercase tracking-wide mt-1">
              SYSTEM MONITORING & HEALTH CHECKS
            </p>
          </div>
          <Button 
            onClick={loadHealth} 
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="uppercase text-xs font-medium tracking-wide">
              {loading ? 'Refreshing' : 'Refresh'}
            </span>
          </Button>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                        <action.icon className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {bottomActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {action.description}
                      </p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                      <action.icon className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {(['OVERVIEW', 'TASKS', 'REPORTS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-6 py-3 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors
                    ${activeTab === tab
                      ? 'text-gray-900 border-gray-900'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {tab === 'OVERVIEW' && <BarChart3 className="w-4 h-4" />}
                    {tab === 'TASKS' && <Activity className="w-4 h-4" />}
                    {tab === 'REPORTS' && <FileText className="w-4 h-4" />}
                    <span>{tab}</span>
                    {tab === 'TASKS' && health.tasks > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        {health.tasks}
                      </span>
                    )}
                    {tab === 'REPORTS' && health.reports > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        {health.reports}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">CLIENTS</h4>
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{health.clients}</p>
                    <p className="text-xs text-gray-600 mt-1">TOTAL CLIENTS</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">TASKS</h4>
                      <Activity className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{health.tasks}</p>
                    <p className="text-xs text-gray-600 mt-1">TOTAL TASKS</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">REPORTS</h4>
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{health.reports}</p>
                    <p className="text-xs text-gray-600 mt-1">TOTAL REPORTS</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">DOCUMENTS</h4>
                      <FolderOpen className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{health.documents}</p>
                    <p className="text-xs text-gray-600 mt-1">TOTAL DOCUMENTS</p>
                  </div>
                </div>

                {/* Compliance Score */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      COMPLIANCE STATUS
                    </h4>
                    <Shield className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {(health.complianceStats?.score * 100 || 0).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">OVERALL SCORE</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-green-600">
                        {health.complianceStats?.compliant || 0}
                      </p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">COMPLIANT</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-red-600">
                        {health.complianceStats?.nonCompliant || 0}
                      </p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">NON-COMPLIANT</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-yellow-600">
                        {health.complianceStats?.needsReview || 0}
                      </p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">NEEDS REVIEW</p>
                    </div>
                  </div>
                </div>

                {/* Recent Documents */}
                {health.recentDocuments && health.recentDocuments.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        RECENT DOCUMENTS
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {health.recentDocuments.map((doc) => (
                        <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {doc.title || doc.fileName}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                {doc.client && (
                                  <p className="text-xs text-gray-600">{doc.client.name}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                  {new Date(doc.uploadedAt).toLocaleDateString('en-US')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`
                                px-2 py-1 text-xs font-medium rounded
                                ${doc.status === 'INDEXED'
                                  ? 'bg-green-100 text-green-700'
                                  : doc.status === 'PROCESSING'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                                }
                              `}>
                                {doc.status}
                              </span>
                              <Link href={`/admin/documents/${doc.id}`}>
                                <Button variant="outline" size="sm" className="text-xs">
                                  VIEW
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'TASKS' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(health.taskStats).map(([status, count]) => (
                  <div key={status} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      {status.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'REPORTS' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(health.reportStats).map(([status, count]) => (
                  <div key={status} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      {status}
                    </h4>
                    <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}