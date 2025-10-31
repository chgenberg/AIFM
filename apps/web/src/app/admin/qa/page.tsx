'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Send, FileText, Loader2, Download } from 'lucide-react';
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

export default function QAPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RAGResponse | null>(null);
  const [history, setHistory] = useState<Array<{ question: string; response: RAGResponse; timestamp: Date }>>([]);

  // Get documentId from URL params if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const documentId = params.get('documentId');
    if (documentId) {
      // Could pre-fill question or filter to specific document
    }
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const documentId = params.get('documentId');
      
      const res = await fetch('/api/documents/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question,
          filters: documentId ? { documentIds: [documentId] } : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await res.json();
      setResponse(data);
      setHistory([{ question, response: data, timestamp: new Date() }, ...history]);
      setQuestion('');
      successToast('Question answered successfully');
    } catch (error) {
      console.error('Error asking question:', error);
      errorToast('Failed to get answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!response) return;

    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rag',
          data: {
            question: history[0]?.question || question,
            response,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to export');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qa-response-${Date.now()}.pdf`;
      a.click();
      successToast('PDF exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      errorToast('Failed to export PDF');
    }
  };

  const handleExportWord = async () => {
    if (!response) return;

    try {
      const res = await fetch('/api/export/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rag',
          data: {
            question: history[0]?.question || question,
            response,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to export');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qa-response-${Date.now()}.docx`;
      a.click();
      successToast('Word document exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      errorToast('Failed to export Word document');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">DOCUMENT Q&A</h1>
          <p className="text-gray-600 text-sm uppercase tracking-wide">
            Ask questions about your documents using AI-powered search
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Q&A Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Input */}
            <Card className="border-2 border-gray-200 bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl uppercase tracking-wide">Ask a Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleAsk();
                    }
                  }}
                  placeholder="Ask a question about your documents... (Ctrl+Enter to submit)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black min-h-[120px] resize-none"
                  disabled={loading}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    The AI will search through all indexed documents
                  </p>
                  <Button
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                    className="rounded-2xl uppercase tracking-wide"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Asking...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Ask
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Response */}
            {response && (
              <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl uppercase tracking-wide">Answer</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleExportPDF}
                        variant="outline"
                        size="sm"
                        className="rounded-2xl uppercase tracking-wide"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button
                        onClick={handleExportWord}
                        variant="outline"
                        size="sm"
                        className="rounded-2xl uppercase tracking-wide"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Word
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-900 whitespace-pre-wrap">{response.answer}</p>
                  </div>

                  {/* Sources */}
                  {response.sources.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-bold uppercase tracking-wide mb-3">Sources</h3>
                      <div className="space-y-3">
                        {response.sources.map((source, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-2xl">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span className="font-semibold text-black">{source.fileName}</span>
                              </div>
                              <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-full">
                                {(source.score * 100).toFixed(1)}% match
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{source.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Citations */}
                  {response.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold uppercase tracking-wide mb-2">Cited Documents</h3>
                      <div className="flex flex-wrap gap-2">
                        {response.citations.map((citation, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold"
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

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-gray-200 bg-white rounded-3xl sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide">History</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No questions asked yet
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {history.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setQuestion(item.question);
                          setResponse(item.response);
                        }}
                      >
                        <p className="text-sm font-semibold text-black line-clamp-2 mb-1">
                          {item.question}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.timestamp.toLocaleTimeString('en-US')}
                        </p>
                      </div>
                    ))}
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
