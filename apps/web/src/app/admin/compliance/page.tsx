'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Shield, RefreshCw, Download, BarChart3, 
  AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { errorToast, successToast } from '@/lib/toast';
import Link from 'next/link';

interface ComplianceCheck {
  id: string;
  documentId: string;
  policyId: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW';
  score: number;
  checkedAt: Date;
  document: {
    id: string;
    fileName: string;
    title?: string;
    client?: { name: string };
  };
  policy: {
    id: string;
    name: string;
    requirement: string;
    category: string;
  };
  notes?: string | null;
  evidence?: string[] | null;
  gaps?: string[] | null;
}

interface ComplianceSummary {
  totalChecks: number;
  compliant: number;
  nonCompliant: number;
  needsReview: number;
  overallScore: number;
  byCategory: Record<string, {
    total: number;
    compliant: number;
    score: number;
  }>;
}

type ComplianceTab = 'OVERVIEW' | 'BY_DOCUMENT' | 'BY_POLICY';

export default function CompliancePage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');
  
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<ComplianceTab>('OVERVIEW');

  useEffect(() => {
    loadComplianceData();
  }, [documentId]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      
      // Load compliance checks
      const url = documentId 
        ? `/api/compliance/checks?documentId=${documentId}`
        : '/api/compliance/checks';
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to load compliance checks');
      const checks = await response.json();
      setComplianceChecks(checks);

      // Load summary
      const summaryResponse = await fetch('/api/compliance/summary');
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      errorToast('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAllCompliance = async () => {
    try {
      setChecking(true);
      const response = await fetch('/api/compliance/check-all', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to run compliance checks');
      
      successToast('Compliance checks completed');
      loadComplianceData();
    } catch (error) {
      console.error('Failed to check compliance:', error);
      errorToast('Failed to run compliance checks');
    } finally {
      setChecking(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/export/pdf?type=compliance', {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to export PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      successToast('PDF exported successfully');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      errorToast('Failed to export PDF');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'NON_COMPLIANT':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'NEEDS_REVIEW':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-green-100 text-green-700';
      case 'NON_COMPLIANT':
        return 'bg-red-100 text-red-700';
      case 'NEEDS_REVIEW':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-pulse text-gray-500">Loading compliance data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">COMPLIANCE MONITORING</h1>
            <p className="text-sm text-gray-600 uppercase tracking-wide mt-1">
              Track regulatory compliance across all documents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCheckAllCompliance}
              disabled={checking}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span className="uppercase text-xs font-medium tracking-wide">
                {checking ? 'Checking' : 'Check All'}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="uppercase text-xs font-medium tracking-wide">Export PDF</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Overall Score
                  </h4>
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {(summary.overallScore * 100).toFixed(0)}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Total Checks
                  </h4>
                  <Shield className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{summary.totalChecks}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Compliant
                  </h4>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{summary.compliant}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Non-Compliant
                  </h4>
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{summary.nonCompliant}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Needs Review
                  </h4>
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">{summary.needsReview}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {(['OVERVIEW', 'BY_DOCUMENT', 'BY_POLICY'] as const).map((tab) => (
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
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'OVERVIEW' && summary && (
              <div className="space-y-6">
                {/* Category Breakdown */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                    Compliance by Category
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(summary.byCategory).map(([category, stats]) => (
                      <div key={category} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{category}</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Score</span>
                            <span className="font-medium">{(stats.score * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Compliant</span>
                            <span className="font-medium">{stats.compliant}/{stats.total}</span>
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-900 h-2 rounded-full"
                            style={{ width: `${stats.score * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Checks */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                    Recent Compliance Checks
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {complianceChecks.slice(0, 5).map((check) => (
                        <div key={check.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getStatusIcon(check.status)}
                                <p className="text-sm font-medium text-gray-900">
                                  {check.policy.name}
                                </p>
                              </div>
                              <p className="text-xs text-gray-600">
                                {check.document.title || check.document.fileName}
                                {check.document.client && ` • ${check.document.client.name}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`
                                px-2 py-1 text-xs font-medium rounded
                                ${getStatusBadgeClass(check.status)}
                              `}>
                                {check.status.replace('_', ' ')}
                              </span>
                              <Link href={`/admin/documents/${check.documentId}`}>
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
                </div>
              </div>
            )}

            {activeTab === 'BY_DOCUMENT' && (
              <div className="space-y-4">
                {/* Group checks by document */}
                {Object.entries(
                  complianceChecks.reduce((acc, check) => {
                    const docId = check.documentId;
                    if (!acc[docId]) acc[docId] = [];
                    acc[docId].push(check);
                    return acc;
                  }, {} as Record<string, ComplianceCheck[]>)
                ).map(([docId, checks]) => {
                  const firstCheck = checks[0];
                  const compliantCount = checks.filter(c => c.status === 'COMPLIANT').length;
                  const score = compliantCount / checks.length;
                  
                  return (
                    <div key={docId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {firstCheck.document.title || firstCheck.document.fileName}
                            </h4>
                            {firstCheck.document.client && (
                              <p className="text-xs text-gray-600 mt-1">
                                {firstCheck.document.client.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {(score * 100).toFixed(0)}%
                              </p>
                              <p className="text-xs text-gray-600">
                                {compliantCount}/{checks.length} compliant
                              </p>
                            </div>
                            <Link href={`/admin/documents/${docId}`}>
                              <Button variant="outline" size="sm" className="text-xs">
                                VIEW DOCUMENT
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {checks.map((check) => (
                          <div key={check.id} className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(check.status)}
                              <span className="text-sm text-gray-700">{check.policy.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              Score: {(check.score * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'BY_POLICY' && (
              <div className="space-y-4">
                {/* Group checks by policy */}
                {Object.entries(
                  complianceChecks.reduce((acc, check) => {
                    const policyId = check.policyId;
                    if (!acc[policyId]) acc[policyId] = [];
                    acc[policyId].push(check);
                    return acc;
                  }, {} as Record<string, ComplianceCheck[]>)
                ).map(([policyId, checks]) => {
                  const firstCheck = checks[0];
                  const compliantCount = checks.filter(c => c.status === 'COMPLIANT').length;
                  const score = compliantCount / checks.length;
                  
                  return (
                    <div key={policyId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {firstCheck.policy.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {firstCheck.policy.category} • {firstCheck.policy.requirement}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {(score * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-gray-600">
                              {compliantCount}/{checks.length} compliant
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {checks.map((check) => (
                          <div key={check.id} className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(check.status)}
                              <span className="text-sm text-gray-700">
                                {check.document.title || check.document.fileName}
                              </span>
                            </div>
                            <Link href={`/admin/documents/${check.documentId}`}>
                              <Button variant="outline" size="sm" className="text-xs">
                                VIEW
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}