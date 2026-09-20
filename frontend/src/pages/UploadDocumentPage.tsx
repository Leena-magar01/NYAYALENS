import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Eye,
  RefreshCw,
  FileCheck,
  Layers,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { documentsService, DocumentItem, DocumentDetailItem } from '../services/documentsService';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const UploadDocumentPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // Selected Document Preview Modal
  const [selectedDoc, setSelectedDoc] = useState<DocumentDetailItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const docs = await documentsService.getDocuments();
      setDocuments(docs);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const validateAndUploadFile = async (file: File) => {
    setUploadError(null);
    const validExtensions = ['pdf', 'docx', 'doc', 'txt'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(ext)) {
      setUploadError(`Invalid file format '.${ext}'. Please upload a PDF, DOCX, or TXT document.`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 15 MB limit.`);
      return;
    }

    setIsUploading(true);
    try {
      await documentsService.uploadDocument(file);
      await fetchDocuments();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Document upload failed. Please try again.';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUploadFile(e.target.files[0]);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document and all extracted chunks?')) return;
    try {
      await documentsService.deleteDocument(docId);
      if (selectedDoc?.id === docId) setSelectedDoc(null);
      await fetchDocuments();
    } catch (err: any) {
      alert('Failed to delete document.');
    }
  };

  const handleViewDetail = async (docId: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await documentsService.getDocument(docId);
      setSelectedDoc(detail);
    } catch (err: any) {
      alert('Could not load document preview details.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Upload Legal Document</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Support for PDF, DOCX, and TXT files with automated OCR fallback, page tracking, and text chunking.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDocuments} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Documents
        </Button>
      </div>

      {uploadError && <ErrorAlert message={uploadError} onClose={() => setUploadError(null)} />}

      {/* Drag and Drop Zone */}
      <Card
        className={`p-8 sm:p-12 text-center border-2 border-dashed transition-all duration-200 ${
          dragActive
            ? 'border-nyaya-800 bg-nyaya-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="p-4 bg-nyaya-100 text-nyaya-900 rounded-2xl inline-block shadow-sm">
            <UploadCloud className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Drag &amp; Drop your legal document here
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supported formats: <strong className="text-slate-700">PDF, DOCX, TXT</strong> (Max file size: 15 MB)
            </p>
          </div>

          <div className="flex justify-center items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              className="gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" /> Browse Files
            </Button>
          </div>

          <p className="text-[11px] text-slate-400">
            Scanned PDFs automatically use OCR image text extraction.
          </p>
        </div>
      </Card>

      {/* Uploaded Documents List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-nyaya-700" /> Uploaded Documents Workbench ({documents.length})
        </h2>

        {isLoading ? (
          <LoadingSpinner label="Loading uploaded documents..." />
        ) : documents.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">No documents uploaded yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Upload a lease agreement, employment contract, or service agreement above.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-5 space-y-4 border-slate-200 hover:border-slate-300">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-nyaya-100 text-nyaya-900 rounded-lg shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate" title={doc.filename}>
                        {doc.filename}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {(doc.file_size / 1024).toFixed(1)} KB • {doc.file_type.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <Badge variant={doc.status === 'analyzed' ? 'emerald' : doc.status === 'processing' ? 'amber' : 'rose'}>
                    {doc.status}
                  </Badge>
                </div>

                {/* Metadata details */}
                <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-100">
                  <div className="flex justify-between">
                    <span>Page Count:</span>
                    <strong className="text-slate-900">{doc.doc_metadata?.page_count || 1} Pages</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Extracted Chunks:</span>
                    <strong className="text-slate-900">{doc.chunk_count} Chunks</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>OCR Applied:</span>
                    <strong className={doc.ocr_applied ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                      {doc.ocr_applied ? 'Yes (Scanned PDF)' : 'No (Vector Text)'}
                    </strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(doc.id)}
                    className="gap-1.5 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview Chunks
                  </Button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Document Detail & Chunks Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="navy">{selectedDoc.file_type.toUpperCase()}</Badge>
                  <Badge variant="emerald">Extracted &amp; Chunked</Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedDoc.filename}</h3>
                <p className="text-xs text-slate-500">
                  {selectedDoc.chunk_count} chunks extracted • Page Count: {selectedDoc.doc_metadata?.page_count || 1}
                </p>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - List Chunks */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-nyaya-700" /> Preserved Chunks &amp; Section Metadata
              </h4>

              {selectedDoc.chunks.map((chunk) => (
                <div key={chunk.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 border-b border-slate-200 pb-2">
                    <span className="font-semibold text-nyaya-900">
                      Chunk #{chunk.chunk_index + 1} • Section: <strong className="text-slate-800">{chunk.section_title || 'General'}</strong>
                    </span>
                    <Badge variant="slate">Page {chunk.page_number || 1}</Badge>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
                    {chunk.text_content}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button variant="secondary" size="md" onClick={() => setSelectedDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
