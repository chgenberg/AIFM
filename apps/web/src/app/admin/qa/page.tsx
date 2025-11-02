'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Send, FileText, Loader2, Download, MessageSquare, Clock, Search } from 'lucide-react';
import { errorToast, successToast } from '@/lib/toast';

interface RAGResponse {
  answer: string;
  sources: Array<{
    documentId: string;
    fileName: string;
    excerpt: string;
    score: number;
  }>;
  citations: string[];
}

interface Document {
  id: string;
  fileName: string;
  title?: string;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  sources: any[];
  citations: string[];
  askedAt: Date;
}

export default function QAPage() {
  const [question, setQuestion] = useState('');
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [response, setResponse] = useState<RAGResponse | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    loadDocuments();
    loadRecentQuestions();
    
    // Check for documentId in URL
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('documentId');
    if (docId) {
      setSelectedDocumentIds([docId]);
    }
  }, []);

  const loadDocuments = async () => {
    try {
      setLoadingDocs(true);
      const response = await fetch('/api/documents?status=INDEXED');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const loadRecentQuestions = async () => {
    try {
      const response = await fetch('/api/documents/questions?limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentQuestions(data);
      }
    } catch (error) {
      console.error('Failed to load recent questions:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      errorToast('Please enter a question');
      return;
    }

    try {
      setLoading(true);
      const filters = selectedDocumentIds.length > 0 
        ? { documentIds: selectedDocumentIds }
        : undefined;

      const response = await fetch('/api/documents/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          filters,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setResponse(data);
      successToast('Question answered successfully');
      
      // Reload recent questions
      loadRecentQuestions();
    } catch (error) {
      console.error('Failed to ask question:', error);
      errorToast('Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!response) return;

    try {
      const pdfResponse = await fetch('/api/export/pdf?type=rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          response,
        }),
      });

      if (!pdfResponse.ok) throw new Error('Failed to export PDF');

      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qa-response-${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      successToast('PDF exported successfully');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      errorToast('Failed to export PDF');
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DOCUMENT Q&A</h1>
          <p className="text-sm text-gray-600 uppercase tracking-wide mt-1">
            Ask questions about your documents using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Q&A Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ask Question Card */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Ask a Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                    Filter by Documents (Optional)
                  </label>
                  <select
                    multiple
                    value={selectedDocumentIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                      setSelectedDocumentIds(selected);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                    size={3}
                  >
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title || doc.fileName}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple documents
                  </p>
                </div>

                {/* Question Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                    Your Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask anything about your documents..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleAskQuestion}
                  disabled={loading || !question.trim()}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="uppercase text-xs font-medium tracking-wide">Processing</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span className="uppercase text-xs font-medium tracking-wide">Ask Question</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Response Card */}
            {response && (
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">Answer</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDF}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wide">Export PDF</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">{response.answer}</p>
                  </div>

                  {response.sources.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                        Sources
                      </h4>
                      <div className="space-y-2">
                        {response.sources.map((source, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">
                                {source.fileName}
                              </p>
                              <span className="text-xs text-gray-500">
                                {(source.score * 100).toFixed(0)}% match
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {source.excerpt}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {response.citations.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                        Document References
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {response.citations.map((citation, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {citation}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Questions */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentQuestions.length > 0 ? (
                  <div className="space-y-3">
                    {recentQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setQuestion(q.question);
                          setResponse({
                            answer: q.answer,
                            sources: q.sources || [],
                            citations: q.citations || [],
                          });
                        }}
                      >
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {q.question}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(q.askedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent questions
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-4">
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-3">
                  Pro Tips
                </h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Ask specific questions for better answers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Search className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Filter by documents to narrow down results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Export answers as PDF for sharing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}