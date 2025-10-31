'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { FileText, Shield, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowLeft, Download, MessageSquare, Trash2, Edit, Archive } from 'lucide-react';
import Link from 'next/link';
import { errorToast, successToast } from '@/lib/toast';
import { EditableField } from '@/components/EditableField';

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  status: string;
  documentType?: string | null;
  category?: string | null;
  title?: string | null;
  description?: string | null;
  tags?: string[];
  uploadedAt: string;
  indexedAt?: string | null;
  client?: {
    id: string;
    name: string;
  };
}

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
    notes?: string;
    checkedAt: string;
  }>;
  gaps: string[];
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params?.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [questions, setQuestions] = useState<Array<{ id: string; question: string; answer: string | null; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (documentId) {
      loadDocument();
      loadComplianceStatus();
      loadQuestions();
    }
  }, [documentId]);

  const loadQuestions = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const loadDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) throw new Error('Failed to load document');
      const data = await response.json();
      setDocument(data.document);
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComplianceStatus = async () => {
    try {
      const response = await fetch(`/api/compliance/status?documentId=${documentId}`);
      if (response.ok) {
        const data = await response.json();
        setComplianceStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to load compliance status:', error);
    }
  };

  const handleDelete = async (permanent: boolean = false) => {
    if (!confirm(`Are you sure you want to ${permanent ? 'permanently delete' : 'archive'} this document?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/documents/${documentId}?permanent=${permanent}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');

      successToast(`Document ${permanent ? 'deleted' : 'archived'} successfully`);
      router.push('/admin/documents');
    } catch (error) {
      console.error('Failed to delete document:', error);
      errorToast('Failed to delete document');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCheckCompliance = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) throw new Error('Failed to check compliance');

      await loadComplianceStatus();
      successToast('Compliance check completed');
    } catch (error) {
      console.error('Failed to check compliance:', error);
      errorToast('Failed to check compliance');
    } finally {
      setChecking(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusColor = (status: string): string => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="page-container py-8">
          <div className="animate-pulse text-gray-500 uppercase tracking-wide">Loading document...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="page-container py-8">
          <Card className="border-2 border-gray-200 bg-white rounded-3xl">
            <CardContent className="text-center py-16">
              <p className="text-lg font-bold text-black uppercase tracking-wide mb-2">Document Not Found</p>
              <Link href="/admin/documents">
                <Button className="rounded-2xl uppercase tracking-wide mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Documents
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin/documents">
              <Button variant="outline" className="rounded-2xl uppercase tracking-wide mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Documents
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">{document.title || document.fileName}</h1>
            <p className="text-gray-600 text-sm uppercase tracking-wide">Document Details & Compliance Status</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Info */}
            <Card className="border-2 border-gray-200 bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl uppercase tracking-wide">Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">File Name</p>
                    <p className="text-black">{document.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">File Size</p>
                    <p className="text-black">{formatFileSize(document.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Type</p>
                    <p className="text-black">{document.documentType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Category</p>
                    <p className="text-black">{document.category || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                      document.status === 'INDEXED' ? 'bg-green-100 text-green-700 border-green-300' :
                      document.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                      document.status === 'ERROR' ? 'bg-red-100 text-red-700 border-red-300' :
                      'bg-gray-100 text-gray-700 border-gray-300'
                    }`}>
                      {document.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Uploaded</p>
                    <p className="text-black">{new Date(document.uploadedAt).toLocaleDateString('en-US')}</p>
                  </div>
                  {document.client && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Client</p>
                      <p className="text-black">{document.client.name}</p>
                    </div>
                  )}
                </div>

                <EditableField
                  label="Title"
                  value={document.title}
                  onSave={async (value) => handleUpdate({ title: value })}
                  placeholder="Enter document title..."
                />

                <EditableField
                  label="Description"
                  value={document.description}
                  onSave={async (value) => handleUpdate({ description: value })}
                  multiline
                  placeholder="Enter document description..."
                />

                {document.tags && document.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <a
                    href={document.storageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold uppercase tracking-wide"
                  >
                    View Document →
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card className="border-2 border-gray-200 bg-white rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl uppercase tracking-wide">Compliance Status</CardTitle>
                  {document.status === 'INDEXED' && (
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
                          <Shield className="w-4 h-4 mr-2" />
                          Re-check
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {complianceStatus ? (
                  <div className="space-y-4">
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
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-bold text-black uppercase tracking-wide mb-2">No Compliance Data</p>
                    {document.status === 'INDEXED' ? (
                      <>
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
                      </>
                    ) : (
                      <p className="text-gray-600 text-sm uppercase tracking-wide">
                        Document must be indexed before compliance checks can be run
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Q&A History */}
            {document.status === 'INDEXED' && questions.length > 0 && (
              <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl uppercase tracking-wide">Q&A History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {questions.slice(0, 5).map((q) => (
                      <div key={q.id} className="p-3 bg-gray-50 rounded-2xl">
                        <p className="text-sm font-semibold text-black mb-1">{q.question}</p>
                        {q.answer && (
                          <p className="text-sm text-gray-600">{q.answer}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(q.createdAt).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    ))}
                  </div>
                  {questions.length > 5 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link href={`/admin/qa/history?documentId=${documentId}`}>
                        <Button variant="outline" className="w-full rounded-2xl uppercase tracking-wide">
                          View All Questions ({questions.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-gray-200 bg-white rounded-3xl sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {document.status === 'INDEXED' && (
                  <>
                    <Link href={`/admin/qa?documentId=${documentId}`}>
                      <Button variant="outline" className="w-full rounded-2xl uppercase tracking-wide">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask About Document
                      </Button>
                    </Link>
                    <Link href={`/admin/compliance?documentId=${documentId}`}>
                      <Button variant="outline" className="w-full rounded-2xl uppercase tracking-wide">
                        <Shield className="w-4 h-4 mr-2" />
                        View Compliance
                      </Button>
                    </Link>
                  </>
                )}
                <a href={document.storageUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full rounded-2xl uppercase tracking-wide">
                    <FileText className="w-4 h-4 mr-2" />
                    View Document
                  </Button>
                </a>
                <div className="pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => handleDelete(false)}
                    disabled={deleting}
                    variant="outline"
                    className="w-full rounded-2xl uppercase tracking-wide text-yellow-600 hover:text-yellow-800"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    {deleting ? 'Archiving...' : 'Archive'}
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm('Are you sure you want to permanently delete this document? This action cannot be undone.')) {
                        handleDelete(true);
                      }
                    }}
                    disabled={deleting}
                    variant="outline"
                    className="w-full rounded-2xl uppercase tracking-wide text-red-600 hover:text-red-800 mt-2"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? 'Deleting...' : 'Delete Permanently'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

