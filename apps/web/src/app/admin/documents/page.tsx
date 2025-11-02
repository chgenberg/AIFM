'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { 
  Upload, X, CheckCircle2, AlertCircle, Loader2, Search, 
  Filter, Shield, MessageSquare, Eye, Trash2, Archive, Download,
  FolderOpen, FileText, Calendar, Tag, ChevronRight
} from 'lucide-react';
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

type FilterTab = 'ALL' | 'INDEXED' | 'PROCESSING' | 'PENDING';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
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

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      errorToast('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch('/api/admin/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('clientId', formData.clientId);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('tags', formData.tags);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      successToast('Document uploaded successfully');
      setShowUploadForm(false);
      setFormData({ clientId: '', title: '', description: '', category: '', tags: '' });
      loadDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      errorToast('Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');
      
      successToast('Document deleted successfully');
      loadDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      errorToast('Failed to delete document');
    }
  };

  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
    setShowPreview(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'INDEXED':
        return 'bg-green-100 text-green-700';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'ERROR':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    // Filter by tab
    if (filterTab !== 'ALL' && doc.status !== filterTab) return false;
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        doc.fileName.toLowerCase().includes(query) ||
        doc.title?.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const statusCounts = {
    ALL: documents.length,
    INDEXED: documents.filter(d => d.status === 'INDEXED').length,
    PROCESSING: documents.filter(d => d.status === 'PROCESSING').length,
    PENDING: documents.filter(d => d.status === 'PENDING').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DOCUMENT MANAGEMENT</h1>
            <p className="text-sm text-gray-600 uppercase tracking-wide mt-1">
              Upload, manage and analyze documents
            </p>
          </div>
          <Button
            onClick={() => setShowUploadForm(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="uppercase text-xs font-medium tracking-wide">Upload Document</span>
          </Button>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs uppercase tracking-wide flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {(['ALL', 'INDEXED', 'PROCESSING', 'PENDING'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`
                    px-6 py-3 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors
                    ${filterTab === tab
                      ? 'text-gray-900 border-gray-900'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>{tab}</span>
                    <span className={`
                      px-2 py-0.5 text-xs font-semibold rounded-full
                      ${filterTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}
                    `}>
                      {statusCounts[tab]}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading documents...</span>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents found</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {doc.title || doc.fileName}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          {doc.client && (
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <FolderOpen className="w-3 h-3" />
                              {doc.client.name}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(doc.uploadedAt).toLocaleDateString('en-US')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(doc.fileSize)}
                          </span>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-gray-400" />
                              {doc.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                              {doc.tags.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{doc.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded
                        ${getStatusBadgeClass(doc.status)}
                      `}>
                        {doc.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(doc)}
                          className="p-2"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {doc.status === 'INDEXED' && (
                          <>
                            <Link href={`/admin/qa?documentId=${doc.id}`}>
                              <Button variant="outline" size="sm" className="p-2">
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/compliance?documentId=${doc.id}`}>
                              <Button variant="outline" size="sm" className="p-2">
                                <Shield className="w-4 h-4" />
                              </Button>
                            </Link>
                          </>
                        )}
                        <Link href={`/admin/documents/${doc.id}`}>
                          <Button variant="outline" size="sm" className="p-2">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                    Client
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
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
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                    placeholder="Document title..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                    File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                    disabled={uploading}
                  />
                </div>

                {uploading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewDocument && (
          <DocumentPreviewModal
            document={previewDocument}
            onClose={() => {
              setShowPreview(false);
              setPreviewDocument(null);
            }}
          />
        )}
      </div>
    </div>
  );
}