'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2, Search, Filter, Shield, MessageSquare, Eye, Trash2, Archive, CheckSquare, Square, Download } from 'lucide-react';
import Link from 'next/link';
import { successToast, errorToast } from '@/lib/toast';
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal';

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  status: string;
  uploadedAt: string;
  documentType?: string | null;
  category?: string | null;
  title?: string | null;
  description?: string | null;
  tags?: string[];
  client?: {
    id: string;
    name: string;
  };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    category: '',
    tags: '',
  });

  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadDocuments();
    loadClients();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, statusFilter, categoryFilter, documentTypeFilter, clientFilter, dateFromFilter, dateToFilter]);

  const filterDocuments = () => {
    let filtered = [...documents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        doc =>
          doc.fileName.toLowerCase().includes(query) ||
          doc.title?.toLowerCase().includes(query) ||
          doc.documentType?.toLowerCase().includes(query) ||
          doc.category?.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }

    // Document type filter
    if (documentTypeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.documentType === documentTypeFilter);
    }

    // Client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter(doc => doc.client?.id === clientFilter);
    }

    // Date filters
    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      filtered = filtered.filter(doc => new Date(doc.uploadedAt) >= fromDate);
    }

    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(doc => new Date(doc.uploadedAt) <= toDate);
    }

    setFilteredDocuments(filtered);
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to load documents');
      const data = await response.json();
      setDocuments(data.documents || []);
      setFilteredDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      if (formData.clientId) formDataToSend.append('clientId', formData.clientId);
      if (formData.title) formDataToSend.append('title', formData.title);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.category) formDataToSend.append('category', formData.category);
      if (formData.tags) formDataToSend.append('tags', formData.tags);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      setUploadProgress(`Successfully uploaded ${file.name}!`);
      successToast(`Document "${file.name}" uploaded successfully`);
      
      // Reset form
      setFormData({
        clientId: '',
        title: '',
        description: '',
        category: '',
        tags: '',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Reload documents
      setTimeout(() => {
        loadDocuments();
        setShowUploadForm(false);
        setUploadProgress(null);
      }, 1500);
    } catch (error: any) {
      setUploadProgress(`Error: ${error.message}`);
      errorToast(`Upload failed: ${error.message}`);
      setTimeout(() => setUploadProgress(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const toggleSelectDocument = (id: string) => {
    setSelectedDocuments(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(d => d.id)));
    }
  };

  const handleBulkAction = async (action: 'archive' | 'delete') => {
    if (selectedDocuments.size === 0) return;

    const confirmMessage = action === 'archive'
      ? `Are you sure you want to archive ${selectedDocuments.size} document(s)?`
      : `Are you sure you want to permanently delete ${selectedDocuments.size} document(s)? This cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    const documentIds = Array.from(selectedDocuments);
    let successCount = 0;
    let errorCount = 0;

    for (const id of documentIds) {
      try {
        const response = await fetch(`/api/documents/${id}?permanent=${action === 'delete'}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      successToast(`${successCount} document(s) ${action === 'archive' ? 'archived' : 'deleted'} successfully`);
    }
    if (errorCount > 0) {
      errorToast(`Failed to ${action} ${errorCount} document(s)`);
    }

    setSelectedDocuments(new Set());
    loadDocuments();
  };

  const handleBulkExport = async (format: 'csv' | 'pdf') => {
    if (selectedDocuments.size === 0) {
      errorToast('Please select documents to export');
      return;
    }

    setExporting(true);
    try {
      const response = await fetch('/api/documents/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: Array.from(selectedDocuments),
          format,
          includeMetadata: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documents-export-${Date.now()}.${format === 'csv' ? 'csv' : 'txt'}`;
      a.click();
      successToast(`Exported ${selectedDocuments.size} document(s) as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      errorToast('Failed to export documents');
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'INDEXED':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'ERROR':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="page-container py-8">
          <div className="animate-pulse text-gray-500 uppercase tracking-wide">Loading documents...</div>
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
            <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">DOCUMENTS</h1>
            <p className="text-gray-600 text-sm uppercase tracking-wide">Upload and manage compliance documents</p>
          </div>
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="rounded-2xl uppercase tracking-wide"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="border-2 border-gray-200 bg-white mb-8 rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl uppercase tracking-wide">Upload New Document</CardTitle>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                  File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                />
                <Button
                  onClick={handleFileSelect}
                  disabled={uploading}
                  variant="outline"
                  className="w-full rounded-2xl uppercase tracking-wide"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Select File'}
                </Button>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                  Client (Optional)
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                  disabled={uploading}
                >
                  <option value="">Select client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Document title..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                  Category (Optional)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                  disabled={uploading}
                >
                  <option value="">Select category...</option>
                  <option value="compliance">Compliance</option>
                  <option value="legal">Legal</option>
                  <option value="financial">Financial</option>
                  <option value="policy">Policy</option>
                  <option value="regulation">Regulation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                  Tags (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                  disabled={uploading}
                />
              </div>

              {uploadProgress && (
                <div className={`p-4 rounded-2xl ${
                  uploadProgress.includes('Error') 
                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                    : uploadProgress.includes('Successfully')
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {uploadProgress.includes('Error') ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : uploadProgress.includes('Successfully') ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                    <span>{uploadProgress}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        <div>
          <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold uppercase tracking-wide">All Documents</h2>
            
            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              {filteredDocuments.length > 0 && (
                <Button
                  onClick={toggleSelectAll}
                  variant="outline"
                  className="rounded-2xl uppercase tracking-wide"
                  title={selectedDocuments.size === filteredDocuments.length ? 'Deselect all' : 'Select all'}
                >
                  {selectedDocuments.size === filteredDocuments.length ? (
                    <CheckSquare className="w-4 h-4 mr-2" />
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  {selectedDocuments.size === filteredDocuments.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="rounded-2xl uppercase tracking-wide"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="border-2 border-gray-200 bg-white mb-4 rounded-3xl">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                    >
                      <option value="all">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="INDEXED">Indexed</option>
                      <option value="ERROR">Error</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                    >
                      <option value="all">All Categories</option>
                      <option value="compliance">Compliance</option>
                      <option value="legal">Legal</option>
                      <option value="financial">Financial</option>
                      <option value="policy">Policy</option>
                      <option value="regulation">Regulation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                      Document Type
                    </label>
                    <select
                      value={documentTypeFilter}
                      onChange={(e) => setDocumentTypeFilter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                    >
                      <option value="all">All Types</option>
                      <option value="policy">Policy</option>
                      <option value="regulation">Regulation</option>
                      <option value="report">Report</option>
                      <option value="evidence">Evidence</option>
                      <option value="contract">Contract</option>
                      <option value="invoice">Invoice</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                      Client
                    </label>
                    <select
                      value={clientFilter}
                      onChange={(e) => setClientFilter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                    >
                      <option value="all">All Clients</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                      Uploaded From
                    </label>
                    <input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                      Uploaded To
                    </label>
                    <input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setDocumentTypeFilter('all');
                      setClientFilter('all');
                      setDateFromFilter('');
                      setDateToFilter('');
                    }}
                    variant="outline"
                    className="rounded-2xl uppercase tracking-wide"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredDocuments.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-white rounded-3xl">
              <CardContent className="text-center py-16">
                <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-bold text-black uppercase tracking-wide mb-2">No Documents</p>
                <p className="text-gray-600 text-sm uppercase tracking-wide">
                  {documents.length === 0
                    ? 'Click "Upload Document" to add your first document'
                    : 'No documents match your search criteria'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Bulk Actions Bar */}
              {selectedDocuments.size > 0 && (
                <Card className="border-2 border-blue-200 bg-blue-50 mb-4 rounded-3xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black uppercase tracking-wide">
                          {selectedDocuments.size} selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleBulkAction('archive')}
                          variant="outline"
                          className="rounded-2xl uppercase tracking-wide text-yellow-600 hover:text-yellow-800"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archive Selected
                        </Button>
                        <Button
                          onClick={() => handleBulkAction('delete')}
                          variant="outline"
                          className="rounded-2xl uppercase tracking-wide text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Selected
                        </Button>
                        <Button
                          onClick={() => setSelectedDocuments(new Set())}
                          variant="outline"
                          className="rounded-2xl uppercase tracking-wide"
                        >
                          Clear Selection
                        </Button>
                        <Button
                          onClick={() => handleBulkExport('csv')}
                          disabled={exporting}
                          variant="outline"
                          className="rounded-2xl uppercase tracking-wide"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mb-2 text-sm text-gray-600 uppercase tracking-wide">
                Showing {filteredDocuments.length} of {documents.length} documents
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className={`border-2 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl ${
                    selectedDocuments.has(doc.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 flex items-start gap-2">
                          <button
                            onClick={() => toggleSelectDocument(doc.id)}
                            className="mt-1"
                          >
                            {selectedDocuments.has(doc.id) ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-black mb-1 line-clamp-2">
                              {doc.fileName}
                            </CardTitle>
                            {doc.client && (
                              <p className="text-sm text-gray-600 mt-1">{doc.client.name}</p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-semibold text-black">{formatFileSize(doc.fileSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-semibold text-black">{doc.fileType.split('/')[1]?.toUpperCase() || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Uploaded:</span>
                          <span className="font-semibold text-black">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="pt-2 flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handlePreview(doc)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold uppercase tracking-wide flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                          <span className="text-gray-300">|</span>
                          <a
                            href={doc.storageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold uppercase tracking-wide"
                          >
                            View →
                          </a>
                          {doc.status === 'INDEXED' && (
                            <>
                              <span className="text-gray-300">|</span>
                              <Link
                                href={`/admin/documents/${doc.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold uppercase tracking-wide"
                              >
                                Details
                              </Link>
                              <span className="text-gray-300">|</span>
                              <a
                                href={`/admin/qa?documentId=${doc.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold uppercase tracking-wide flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                Ask
                              </a>
                              <span className="text-gray-300">|</span>
                              <a
                                href={`/admin/compliance?documentId=${doc.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold uppercase tracking-wide flex items-center gap-1"
                              >
                                <Shield className="w-3 h-3" />
                                Compliance
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewDocument(null);
        }}
      />
      <Footer />
    </div>
  );
}

