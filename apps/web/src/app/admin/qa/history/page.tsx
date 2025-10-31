'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { MessageSquare, FileText, Search } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  answer: string | null;
  sources: any;
  createdAt: string;
  answeredAt: string | null;
  document?: {
    id: string;
    fileName: string;
    title: string | null;
  } | null;
}

export default function QAHistoryPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDocumentId, setFilterDocumentId] = useState<string>('all');
  const [documents, setDocuments] = useState<Array<{ id: string; fileName: string }>>([]);

  useEffect(() => {
    loadQuestions();
    loadDocuments();
  }, [filterDocumentId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filterDocumentId !== 'all') {
        query.append('documentId', filterDocumentId);
      }
      query.append('limit', '100');

      const response = await fetch(`/api/documents/questions?${query.toString()}`);
      if (!response.ok) throw new Error('Failed to load questions');
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
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

  const filteredQuestions = questions.filter(q => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        q.question.toLowerCase().includes(query) ||
        q.answer?.toLowerCase().includes(query) ||
        q.document?.fileName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="page-container py-8">
          <div className="animate-pulse text-gray-500 uppercase tracking-wide">Loading questions...</div>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">Q&A HISTORY</h1>
          <p className="text-gray-600 text-sm uppercase tracking-wide">
            View all questions asked about your documents
          </p>
        </div>

        {/* Filters */}
        <Card className="border-2 border-gray-200 bg-white mb-6 rounded-3xl">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions or answers..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                />
              </div>
              <select
                value={filterDocumentId}
                onChange={(e) => setFilterDocumentId(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
              >
                <option value="all">All Documents</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.fileName}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div>
          <div className="mb-4 text-sm text-gray-600 uppercase tracking-wide">
            Showing {filteredQuestions.length} of {questions.length} questions
          </div>
          {filteredQuestions.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-white rounded-3xl">
              <CardContent className="text-center py-16">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-bold text-black uppercase tracking-wide mb-2">No Questions Found</p>
                <p className="text-gray-600 text-sm uppercase tracking-wide mb-4">
                  {questions.length === 0
                    ? 'No questions have been asked yet'
                    : 'No questions match your search criteria'}
                </p>
                {questions.length === 0 && (
                  <Link href="/admin/qa">
                    <Button className="rounded-2xl uppercase tracking-wide">
                      Ask Your First Question
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <Card key={question.id} className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-black mb-2">
                          {question.question}
                        </CardTitle>
                        {question.document && (
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <Link
                              href={`/admin/documents/${question.document.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {question.document.title || question.document.fileName}
                            </Link>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {question.answer ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Answer</p>
                          <p className="text-gray-900 whitespace-pre-wrap">{question.answer}</p>
                        </div>
                        {question.sources && Array.isArray(question.sources) && question.sources.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Sources</p>
                            <div className="space-y-2">
                              {question.sources.map((source: any, index: number) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-2xl">
                                  <p className="text-xs font-semibold text-black">{source.fileName || source.title || `Source ${index + 1}`}</p>
                                  {source.excerpt && (
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{source.excerpt}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No answer yet</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

