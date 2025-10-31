'use client';

import { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Download, RefreshCw, Loader2, Mail, BarChart3 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { errorToast, successToast } from '@/lib/toast';
import Link from 'next/link';

interface ComplianceStatus {
  overall: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW' | 'PENDING';
  score: number;
  checks: Array<{
    policyId: string;
    policyName: string;
    requirement: string;
    status: string;
    score: number;
    gaps?: string[];
    evidence?: string[];
  }>;
  gaps: string[];
}

interface GapAnalysis {
  gaps: Array<{
    id: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    documentId?: string;
    policyId?: string;
    recommendation?: string;
  }>;
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  };
  recommendations: string[];
}

function ComplianceDashboardContent() {
  const searchParams = useSearchParams();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Array<{ id: string; fileName: string; status: string }>>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notificationEmails, setNotificationEmails] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadDocuments();
    loadSummary();
    // Check if documentId is provided in URL params
    const documentIdFromUrl = searchParams?.get('documentId');
    if (documentIdFromUrl) {
      setSelectedDocumentId(documentIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedDocumentId) {
      loadComplianceStatus(selectedDocumentId);
      loadGapAnalysis(selectedDocumentId);
    }
  }, [selectedDocumentId]);

  const loadSummary = async () => {
    try {
      const response = await fetch('/api/compliance/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Failed to load compliance summary:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents?.filter((d: any) => d.status === 'INDEXED') || []);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const loadComplianceStatus = async (documentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/compliance/status?documentId=${documentId}`);
      if (!response.ok) throw new Error('Failed to load compliance status');
      const data = await response.json();
      setComplianceStatus(data.status);
    } catch (error) {
      console.error('Failed to load compliance status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGapAnalysis = async (documentId: string) => {
    try {
      const response = await fetch('/api/compliance/gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });
      if (response.ok) {
        const data = await response.json();
        setGapAnalysis(data);
      }
    } catch (error) {
      console.error('Failed to load gap analysis:', error);
    }
  };

  const handleCheckCompliance = async () => {
    if (!selectedDocumentId) return;

    setChecking(true);
    try {
      const response = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedDocumentId }),
      });

      if (!response.ok) throw new Error('Failed to check compliance');

      // Reload status
      await loadComplianceStatus(selectedDocumentId);
      await loadGapAnalysis(selectedDocumentId);
      successToast('Compliance check completed');
    } catch (error) {
      console.error('Failed to check compliance:', error);
      errorToast('Failed to check compliance');
    } finally {
      setChecking(false);
    }
  };

  const handleSendNotifications = async () => {
    if (!complianceStatus || !selectedDocumentId) return;

    const emails = notificationEmails.split(',').map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) {
      errorToast('Please enter at least one email address');
      return;
    }

    setNotifying(true);
    try {
      const response = await fetch('/api/compliance/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          complianceStatus,
          recipients: emails,
        }),
      });

      if (!response.ok) throw new Error('Failed to send notifications');

      const data = await response.json();
      if (data.sent) {
        successToast(`Notifications sent to ${data.recipients.successful} recipient(s)`);
        setNotificationEmails('');
      } else {
        errorToast('No compliance issues found. No notifications sent.');
      }
    } catch (error) {
      console.error('Failed to send notifications:', error);
    } finally {
      setNotifying(false);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedDocumentId || !complianceStatus) return;

    try {
      const document = documents.find(d => d.id === selectedDocumentId);
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'compliance',
          data: {
            documentName: document?.fileName || 'Unknown',
            checks: complianceStatus.checks,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${Date.now()}.pdf`;
      a.click();
      successToast('Compliance report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      errorToast('Failed to export PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'NON_COMPLIANT':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'NEEDS_REVIEW':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">COMPLIANCE DASHBOARD</h1>
          <p className="text-gray-600 text-sm uppercase tracking-wide">
            Monitor compliance status and gaps for your documents
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Toggle */}
            <Card className="border-2 border-gray-200 bg-white rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl uppercase tracking-wide">Compliance Overview</CardTitle>
                  <Button
                    onClick={() => setShowSummary(!showSummary)}
                    variant="outline"
                    size="sm"
                    className="rounded-2xl uppercase tracking-wide"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {showSummary ? 'Hide Summary' : 'Show Summary'}
                  </Button>
                </div>
              </CardHeader>
              {showSummary && summary && (
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-50 rounded-2xl">
                      <p className="text-2xl font-bold text-black">{summary.summary.total}</p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Total Checks</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-2xl">
                      <p className="text-2xl font-bold text-green-700">{summary.summary.compliant}</p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Compliant</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-2xl">
                      <p className="text-2xl font-bold text-red-700">{summary.summary.nonCompliant}</p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Non-Compliant</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-2xl">
                      <p className="text-2xl font-bold text-yellow-700">{summary.summary.needsReview}</p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Needs Review</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-2xl">
                    <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">Overall Compliance Score</p>
                    <p className="text-3xl font-bold text-black">
                      {(summary.summary.overallScore * 100).toFixed(1)}%
                    </p>
                  </div>
                  {summary.documentsWithIssues.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Documents with Issues ({summary.documentsWithIssues.length})
                      </h4>
                      <div className="space-y-2">
                        {summary.documentsWithIssues.map((doc: any) => (
                          <Link
                            key={doc.documentId}
                            href={`/admin/compliance?documentId=${doc.documentId}`}
                            className="block p-2 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
                          >
                            <p className="text-sm font-semibold text-black">{doc.fileName}</p>
                            <p className="text-xs text-gray-600">{doc.policyName} - {doc.status}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Document Selector */}
            <Card className="border-2 border-gray-200 bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl uppercase tracking-wide">Select Document</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedDocumentId || ''}
                  onChange={(e) => setSelectedDocumentId(e.target.value || null)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                >
                  <option value="">Select a document...</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.fileName}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            {selectedDocumentId && (
              <>
                {loading ? (
                  <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                    <CardContent className="py-16 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="mt-4 text-gray-600 uppercase tracking-wide">Loading compliance status...</p>
                    </CardContent>
                  </Card>
                ) : complianceStatus ? (
                  <>
                    <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl uppercase tracking-wide">Compliance Status</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleCheckCompliance}
                              disabled={checking}
                              variant="outline"
                              size="sm"
                              className="rounded-2xl uppercase tracking-wide"
                            >
                              {checking ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Checking...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Re-check
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={handleExportPDF}
                              variant="outline"
                              size="sm"
                              className="rounded-2xl uppercase tracking-wide"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export PDF
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Overall Status */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                            <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">Overall Status</p>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(complianceStatus.overall)}`}>
                              {complianceStatus.overall}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">Compliance Score</p>
                            <p className="text-2xl font-bold text-black">
                              {(complianceStatus.score * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Policy Checks */}
                        {complianceStatus.checks.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold uppercase tracking-wide mb-3">Policy Checks</h3>
                            <div className="space-y-3">
                              {complianceStatus.checks.map((check, index) => (
                                <div key={index} className="p-4 border-2 border-gray-200 rounded-2xl">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="font-semibold text-black">{check.policyName}</p>
                                      <p className="text-sm text-gray-600 mt-1">{check.requirement}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(check.status)}`}>
                                      {check.status}
                                    </span>
                                  </div>
                                  <div className="mt-2 flex items-center gap-4">
                                    <span className="text-xs text-gray-600">
                                      Score: {(check.score * 100).toFixed(1)}%
                                    </span>
                                    {check.evidence && check.evidence.length > 0 && (
                                      <span className="text-xs text-green-600">
                                        {check.evidence.length} evidence found
                                      </span>
                                    )}
                                    {check.gaps && check.gaps.length > 0 && (
                                      <span className="text-xs text-red-600">
                                        {check.gaps.length} gaps
                                      </span>
                                    )}
                                  </div>
                                  {check.gaps && check.gaps.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Gaps:</p>
                                      <ul className="list-disc list-inside text-xs text-gray-600">
                                        {check.gaps.map((gap, idx) => (
                                          <li key={idx}>{gap}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Gap Analysis */}
                    {gapAnalysis && gapAnalysis.gaps.length > 0 && (
                      <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                        <CardHeader>
                          <CardTitle className="text-xl uppercase tracking-wide">Gap Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Summary */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-2xl">
                              <p className="text-2xl font-bold text-black">{gapAnalysis.summary.total}</p>
                              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Total Gaps</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-2xl">
                              <p className="text-2xl font-bold text-red-700">{gapAnalysis.summary.high}</p>
                              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">High Priority</p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-2xl">
                              <p className="text-2xl font-bold text-yellow-700">{gapAnalysis.summary.medium}</p>
                              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Medium</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-2xl">
                              <p className="text-2xl font-bold text-blue-700">{gapAnalysis.summary.low}</p>
                              <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Low</p>
                            </div>
                          </div>

                          {/* Gaps List */}
                          <div className="space-y-3">
                            {gapAnalysis.gaps.map((gap) => (
                              <div key={gap.id} className="p-4 border-2 border-gray-200 rounded-2xl">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="font-semibold text-black">{gap.title}</p>
                                    <p className="text-sm text-gray-600 mt-1">{gap.description}</p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getSeverityColor(gap.severity)}`}>
                                    {gap.severity.toUpperCase()}
                                  </span>
                                </div>
                                {gap.recommendation && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Recommendation:</p>
                                    <p className="text-sm text-gray-700">{gap.recommendation}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Recommendations */}
                          {gapAnalysis.recommendations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h3 className="text-lg font-bold uppercase tracking-wide mb-3">Recommendations</h3>
                              <ul className="list-disc list-inside space-y-2">
                                {gapAnalysis.recommendations.map((rec, index) => (
                                  <li key={index} className="text-sm text-gray-700">{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                    <CardContent className="py-16 text-center">
                      <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-bold text-black uppercase tracking-wide mb-2">No Compliance Data</p>
                      <p className="text-gray-600 text-sm uppercase tracking-wide mb-4">
                        Click "Re-check" to run compliance checks
                      </p>
                      <Button
                        onClick={handleCheckCompliance}
                        disabled={checking}
                        className="rounded-2xl uppercase tracking-wide"
                      >
                        {checking ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Check Compliance
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-gray-200 bg-white rounded-3xl sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => {
                    if (selectedDocumentId) {
                      window.open(`/api/export/pdf?type=compliance&documentId=${selectedDocumentId}`, '_blank');
                    }
                  }}
                  variant="outline"
                  className="w-full rounded-2xl uppercase tracking-wide"
                  disabled={!selectedDocumentId}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Compliance PDF
                </Button>
                <Button
                  onClick={() => {
                    if (selectedDocumentId) {
                      window.open(`/api/export/pdf?type=gap-analysis&documentId=${selectedDocumentId}`, '_blank');
                    }
                  }}
                  variant="outline"
                  className="w-full rounded-2xl uppercase tracking-wide"
                  disabled={!selectedDocumentId}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Gap Analysis PDF
                </Button>
                <Button
                  onClick={() => selectedDocumentId && window.open(`/admin/qa?documentId=${selectedDocumentId}`, '_blank')}
                  variant="outline"
                  className="w-full rounded-2xl uppercase tracking-wide"
                  disabled={!selectedDocumentId}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Ask About Document
                </Button>
                {complianceStatus && (complianceStatus.overall === 'NON_COMPLIANT' || complianceStatus.overall === 'NEEDS_REVIEW') && (
                  <div className="pt-3 border-t border-gray-200 space-y-3">
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                        Send Notifications (comma-separated emails)
                      </label>
                      <input
                        type="text"
                        value={notificationEmails}
                        onChange={(e) => setNotificationEmails(e.target.value)}
                        placeholder="email1@example.com, email2@example.com"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleSendNotifications}
                      disabled={notifying || !notificationEmails.trim()}
                      className="w-full rounded-2xl uppercase tracking-wide"
                    >
                      {notifying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Notifications
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ComplianceDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="page-container py-8">
          <div className="animate-pulse text-gray-500 uppercase tracking-wide">Loading...</div>
        </div>
        <Footer />
      </div>
    }>
      <ComplianceDashboardContent />
    </Suspense>
  );
}
