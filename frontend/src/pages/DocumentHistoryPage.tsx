import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  FileText,
  Search,
  Trash2,
  ExternalLink,
  FileSearch,
  Radar,
  MessageSquareText,
  Briefcase,
  AlertTriangle,
  Clock,
  RefreshCw,
  Layers,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { documentsService, DocumentItem } from '../services/documentsService';

export const DocumentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentsService.getDocuments();
      setDocuments(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch document history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await documentsService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setDeleteDocId(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="navy">User Archive</Badge>
            <Badge variant="indigo">Security Isolated</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-nyaya-700" />
            Document History &amp; Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your past uploaded legal contracts, processing states, chunk extractions, and document actions.
          </p>
        </div>

        <Button onClick={fetchDocuments} variant="outline" size="sm" className="gap-2 shrink-0">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </Button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Filters & Search Bar */}
      <Card className="p-4 border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-nyaya-500"
              aria-label="Search documents by filename"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-medium text-slate-600 shrink-0">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nyaya-500"
              aria-label="Filter documents by status"
            >
              <option value="all">All Statuses</option>
              <option value="analyzed">Analyzed / Ready</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Content Table or Loading */}
      {loading ? (
        <LoadingSpinner label="Retrieving document history..." />
      ) : filteredDocuments.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-slate-200 shadow-2xs">
          <div className="p-4 bg-slate-100 text-slate-500 rounded-2xl inline-block">
            <FileText className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Documents Found</h3>
            <p className="text-xs text-slate-500">
              {searchQuery || statusFilter !== 'all'
                ? 'No document records match your search filters.'
                : 'You have not uploaded any legal documents yet.'}
            </p>
          </div>
          <Button onClick={() => navigate('/upload')} variant="primary" size="sm">
            Upload Document
          </Button>
        </Card>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Size &amp; Format</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">OCR State</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="p-2 bg-nyaya-50 text-nyaya-800 rounded-lg shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-xs" title={doc.filename}>
                        <p className="truncate font-semibold text-slate-900">{doc.filename}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {doc.id.substring(0, 8)}...</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-600">{formatBytes(doc.file_size)}</span>
                      <span className="ml-1.5 uppercase font-bold text-[10px] text-slate-400">.{doc.file_type}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {doc.status === 'analyzed' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : doc.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {doc.ocr_applied ? (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                          OCR Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Native Text</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {doc.chunk_count}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDate(doc.created_at)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/analysis?docId=${doc.id}`)}
                          className="p-1.5 text-slate-600 hover:text-nyaya-700 hover:bg-nyaya-50 rounded-md transition-colors"
                          title="View Analysis"
                          aria-label={`View analysis for ${doc.filename}`}
                        >
                          <FileSearch className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => navigate(`/clauses?docId=${doc.id}`)}
                          className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Clause Radar"
                          aria-label={`Clause radar for ${doc.filename}`}
                        >
                          <Radar className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => navigate(`/ask?docId=${doc.id}`)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Ask Document (RAG)"
                          aria-label={`Ask document RAG for ${doc.filename}`}
                        >
                          <MessageSquareText className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => navigate(`/brief?docId=${doc.id}`)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                          title="Lawyer Brief"
                          aria-label={`Generate brief for ${doc.filename}`}
                        >
                          <Briefcase className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteDocId(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors ml-1"
                          title="Delete Document"
                          aria-label={`Delete ${doc.filename}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDocId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-xl border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Document Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this document and all associated extractions, Q&amp;A history, timelines, and checklists? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDocId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(deleteDocId)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentHistoryPage;
