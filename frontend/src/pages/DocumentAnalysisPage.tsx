import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { documentsService, DocumentItem } from '../services/documentsService';
import { analysisService, DocumentAnalysisData } from '../services/analysisService';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const DocumentAnalysisPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [analysis, setAnalysis] = useState<DocumentAnalysisData | null>(null);
  
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'clauses' | 'obligations' | 'concerns'>('overview');

  useEffect(() => {
    const init = async () => {
      try {
        const docs = await documentsService.getDocuments();
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDocId(docs[0].id);
        }
      } catch (err: any) {
        setError('Failed to fetch documents list.');
      } finally {
        setIsLoadingDocs(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedDocId) return;
    const loadAnalysis = async () => {
      setIsAnalyzing(true);
      setError(null);
      try {
        const data = await analysisService.getAnalysis(selectedDocId);
        setAnalysis(data);
      } catch (err: any) {
        setError('Failed to load document analysis.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    loadAnalysis();
  }, [selectedDocId]);

  const handleReanalyze = async () => {
    if (!selectedDocId) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analysisService.triggerAnalysis(selectedDocId);
      setAnalysis(data);
    } catch (err: any) {
      setError('Re-analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoadingDocs) {
    return <LoadingSpinner label="Fetching your legal documents..." />;
  }

  if (documents.length === 0) {
    return (
      <Card className="p-12 text-center max-w-xl mx-auto space-y-4">
        <FileSearch className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Documents Uploaded</h2>
        <p className="text-xs text-slate-500">
          Upload a lease agreement, employment contract, or service agreement to run AI Document Analysis.
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
    <div className="space-y-8">
      {/* Top Header & Document Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="navy">AI Legal Analyzer</Badge>
            <Badge variant="emerald">Live Structured Schema</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Legal Document Analysis</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated entity extraction, clause breakdown, obligation summary, and potential concern detection.
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

          <Button variant="outline" size="sm" onClick={handleReanalyze} isLoading={isAnalyzing} className="gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-nyaya-700" /> Re-Analyze
          </Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {isAnalyzing ? (
        <LoadingSpinner label="Running NyayaLens AI Extraction & Clause Breakdown..." />
      ) : !analysis ? (
        <Card className="p-8 text-center text-slate-500">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold">Select a document above to view AI analysis.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Banner */}
          <Card className="p-6 bg-slate-900 text-white border-slate-800 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Extracted Classification</span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">{analysis.document_type}</h2>
              </div>
              <Badge variant="amber" size="md">
                {analysis.clauses.length} Clauses Extracted
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              <strong className="text-amber-400">Executive Summary:</strong> {analysis.summary}
            </p>

            {/* Quick Metrics Cards inside Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700/60 flex items-start gap-2.5">
                <Users className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Parties Identified</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">{analysis.parties.join(', ') || 'N/A'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700/60 flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Important Dates</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">
                    {analysis.important_dates.map(d => d.date).join(', ') || 'See Timeline'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700/60 flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Financial Terms</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">
                    {analysis.financial_terms.map(f => f.term).join(' | ') || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 space-x-4">
            {[
              { id: 'overview', label: 'Overview & Entities' },
              { id: 'clauses', label: `Clauses (${analysis.clauses.length})` },
              { id: 'obligations', label: 'Obligations & Rights' },
              { id: 'concerns', label: `Potential Concerns (${analysis.findings.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-nyaya-900 text-nyaya-950 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-nyaya-700" /> Contract Parties &amp; Entities
                </h3>
                <ul className="space-y-2">
                  {analysis.parties.map((party, idx) => (
                    <li key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{party}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Extracted Financial Terms
                </h3>
                <ul className="space-y-2">
                  {analysis.financial_terms.map((item, idx) => (
                    <li key={idx} className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/80 text-xs space-y-0.5">
                      <strong className="text-emerald-900 font-bold">{item.term}</strong>
                      {item.source && <p className="text-[10px] text-emerald-700 italic">Source: {item.source}</p>}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* Tab 2: Extracted Clauses */}
          {activeTab === 'clauses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Important Clauses &amp; Plain Language Translation
                </h3>
                <Link to="/clauses" className="text-xs font-bold text-nyaya-700 hover:underline flex items-center gap-1">
                  Open Interactive Radar <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {analysis.clauses.map((clause) => (
                  <Card key={clause.id} className="p-6 space-y-4 border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="navy">{clause.category}</Badge>
                        <Badge variant="slate">Page {clause.page_number} • {clause.section_ref}</Badge>
                      </div>
                      {clause.potential_concern && (
                        <Badge variant="amber" className="gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-700" /> Requires Review
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Original Clause */}
                      <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs space-y-1 font-mono">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Unaltered Original Clause</span>
                        <p className="leading-relaxed whitespace-pre-wrap">{clause.original_text}</p>
                      </div>

                      {/* Simplified Breakdown */}
                      <div className="p-4 bg-nyaya-50/60 rounded-xl text-xs space-y-2 border border-nyaya-100">
                        <div>
                          <strong className="text-nyaya-950 font-bold block text-sm">Simple Explanation:</strong>
                          <p className="text-slate-700 mt-0.5">{clause.simple_explanation}</p>
                        </div>

                        <div>
                          <strong className="text-nyaya-900 font-semibold block">Why It Matters:</strong>
                          <p className="text-slate-600 mt-0.5">{clause.why_it_matters}</p>
                        </div>

                        <div>
                          <strong className="text-nyaya-900 font-semibold block">User Responsibility:</strong>
                          <p className="text-slate-600 mt-0.5">{clause.user_responsibility}</p>
                        </div>

                        {clause.potential_concern && (
                          <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-lg text-amber-900 mt-2">
                            <strong className="font-bold flex items-center gap-1 text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" /> Potential Concern / Risk Note:
                            </strong>
                            <p className="text-[11px] mt-0.5 text-amber-950">{clause.potential_concern}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Obligations & Rights */}
          {activeTab === 'obligations' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900">Key Obligations</h3>
                <ul className="space-y-2 text-xs">
                  {analysis.obligations.map((ob, i) => (
                    <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-slate-800">{ob.obligation}</p>
                      {ob.party && <span className="text-[10px] text-slate-500 block mt-1">Party: {ob.party}</span>}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-emerald-900">Entitled Rights</h3>
                <ul className="space-y-2 text-xs">
                  {analysis.rights.map((r, i) => (
                    <li key={i} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                      <p className="text-emerald-950">{r.right}</p>
                      {r.party && <span className="text-[10px] text-emerald-700 block mt-1">Party: {r.party}</span>}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-rose-900">Contractual Restrictions</h3>
                <ul className="space-y-2 text-xs">
                  {analysis.restrictions.map((rst, i) => (
                    <li key={i} className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg">
                      <p className="text-rose-950">{rst.restriction}</p>
                      {rst.party && <span className="text-[10px] text-rose-700 block mt-1">Party: {rst.party}</span>}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* Tab 4: Potential Concerns */}
          {activeTab === 'concerns' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Flagged Potential Concerns &amp; Ambiguities ({analysis.findings.length})
              </h3>

              {analysis.findings.length === 0 ? (
                <Card className="p-8 text-center text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold">No high-risk potential concerns flagged for this agreement.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.findings.map((finding) => (
                    <Card key={finding.id} className="p-5 border-amber-200 bg-amber-50/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={finding.severity === 'High' ? 'rose' : 'amber'}>
                          {finding.severity} Severity Risk
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-500">Page {finding.page_number}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{finding.title}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed">{finding.explanation}</p>

                      <div className="pt-2 border-t border-amber-200/80 text-[11px] text-slate-600">
                        <strong className="text-slate-800 block mb-0.5">Supporting Source Text:</strong>
                        <p className="italic font-mono bg-white p-2 rounded border border-amber-200">
                          "{finding.supporting_text}"
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
