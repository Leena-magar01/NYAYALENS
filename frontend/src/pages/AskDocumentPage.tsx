import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  Send,
  HelpCircle,
  FileText,
  Trash2,
  ShieldCheck,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock
} from 'lucide-react';
import { documentsService, DocumentItem } from '../services/documentsService';
import { qaService, QuestionAnswerItem } from '../services/qaService';
import { Card, Button, Badge, Input } from '../components/common/UIComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const AskDocumentPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [history, setHistory] = useState<QuestionAnswerItem[]>([]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'What happens if I terminate this agreement early?',
    'How much notice is required for termination or renewal?',
    'When does this agreement expire?',
    'What are my payment obligations and due dates?',
    'Are there any penalties or late payment fees?',
  ];

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await documentsService.getDocuments();
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDocId(docs[0].id);
        }
      } catch (err: any) {
        setError('Failed to fetch documents.');
      } finally {
        setIsLoadingDocs(false);
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    if (!selectedDocId) return;
    const fetchHistory = async () => {
      try {
        const data = await qaService.getQuestionHistory(selectedDocId);
        setHistory(data);
      } catch (err: any) {
        console.error('Failed to load Q&A history:', err);
      }
    };
    fetchHistory();
  }, [selectedDocId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAsking]);

  const handleSendQuestion = async (qText?: string) => {
    const query = (qText || inputQuestion).trim();
    if (!query || !selectedDocId || isAsking) return;

    setInputQuestion('');
    setIsAsking(true);
    setError(null);

    try {
      const newQa = await qaService.askQuestion(selectedDocId, query);
      setHistory((prev) => [...prev, newQa]);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate grounded answer.';
      setError(msg);
    } finally {
      setIsAsking(false);
    }
  };

  const handleClearHistory = async () => {
    if (!selectedDocId || history.length === 0) return;
    if (!window.confirm('Clear conversation history for this document?')) return;
    try {
      await qaService.clearQuestionHistory(selectedDocId);
      setHistory([]);
    } catch (err: any) {
      alert('Failed to clear Q&A history.');
    }
  };

  if (isLoadingDocs) {
    return <LoadingSpinner label="Initializing RAG Q&A Engine..." />;
  }

  if (documents.length === 0) {
    return (
      <Card className="p-12 text-center max-w-xl mx-auto space-y-4">
        <MessageSquareText className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Ask Your Document Ready</h2>
        <p className="text-xs text-slate-500">
          Upload a legal agreement to ask grounded questions with page citations and supporting excerpts.
        </p>
        <Link to="/upload" className="inline-block pt-2">
          <Button variant="primary" size="md" className="gap-2">
            Upload Document First <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="navy">Module 6: RAG Q&amp;A</Badge>
            <Badge variant="emerald" className="gap-1">
              <Lock className="w-3 h-3 text-emerald-700" /> Untrusted Data Sandboxed
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Ask Your Document</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Grounded vector retrieval question answering with strict page citations and prompt-injection defense.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-nyaya-800 shadow-2xs"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.filename} ({d.file_type.toUpperCase()})
              </option>
            ))}
          </select>

          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearHistory} className="gap-1 text-xs">
              <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Clear Thread
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Suggested Questions Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-nyaya-700" /> Suggested Legal Questions
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(q)}
              disabled={isAsking}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-nyaya-400 hover:bg-nyaya-50 text-slate-700 text-xs font-medium rounded-full transition-all text-left shadow-2xs disabled:opacity-50"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread Interface Container */}
      <Card className="p-4 sm:p-6 flex flex-col min-h-[500px] max-h-[650px] border-slate-200 shadow-md">
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {history.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="p-4 bg-nyaya-50 text-nyaya-900 rounded-2xl inline-block shadow-sm">
                <MessageSquareText className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Start Asking Questions About Your Agreement</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Type your question below or select a suggested question above. Answers are strictly grounded in your document with page citations.
              </p>
            </div>
          ) : (
            history.map((qa) => (
              <div key={qa.id} className="space-y-3">
                {/* User Question */}
                <div className="flex items-start justify-end gap-2.5">
                  <div className="bg-nyaya-900 text-white rounded-2xl rounded-tr-none px-4 py-3 text-xs max-w-lg shadow-sm">
                    <p className="font-medium">{qa.question}</p>
                  </div>
                </div>

                {/* AI Answer & Source Citations */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-1 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>

                  <div className="space-y-3 max-w-2xl w-full">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 text-xs text-slate-900 space-y-3 shadow-2xs">
                      {/* Grounding & Confidence Bar */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-1.5">
                          {qa.grounded ? (
                            <Badge variant="emerald" className="gap-1 font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" /> 100% Grounded in Document
                            </Badge>
                          ) : (
                            <Badge variant="amber" className="gap-1 font-bold">
                              <AlertTriangle className="w-3 h-3 text-amber-700" /> Insufficient Information
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Confidence: {(qa.confidence_score * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Main Answer Content */}
                      <div className="prose prose-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                        {qa.answer}
                      </div>

                      {/* Source Citations Block */}
                      {qa.sources_json && qa.sources_json.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-nyaya-700" /> Supporting Document Citations ({qa.sources_json.length})
                          </span>

                          <div className="space-y-2">
                            {qa.sources_json.map((src, i) => (
                              <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] space-y-1 shadow-2xs">
                                <div className="flex items-center justify-between font-semibold text-nyaya-950">
                                  <span>Section: {src.section_title || 'General'}</span>
                                  <Badge variant="slate" size="sm">Page {src.page_number}</Badge>
                                </div>
                                <p className="text-slate-600 font-mono italic text-[10px] leading-tight">
                                  "{src.excerpt}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {isAsking && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-500">
                Searching vector chunks &amp; verifying document evidence...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuestion();
          }}
          className="mt-4 pt-3 border-t border-slate-200 flex gap-2"
        >
          <Input
            placeholder="Ask a question about this document (e.g. What is the early termination penalty?)..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={isAsking}
          />

          <Button type="submit" variant="primary" size="md" isLoading={isAsking} className="gap-1.5 shrink-0 px-5">
            <Send className="w-4 h-4" /> Ask
          </Button>
        </form>
      </Card>
    </div>
  );
};
