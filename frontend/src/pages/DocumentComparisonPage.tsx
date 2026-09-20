import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  BookOpen,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { documentsService, DocumentItem } from '../services/documentsService';
import { comparisonService, ComparisonData } from '../services/comparisonService';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const DocumentComparisonPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docAId, setDocAId] = useState<string>('');
  const [docBId, setDocBId] = useState<string>('');
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'matrix' | 'differences' | 'single' | 'values' | 'recommendations'>('matrix');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await documentsService.getDocuments();
        setDocuments(docs);
        if (docs.length >= 2) {
          setDocAId(docs[0].id);
          setDocBId(docs[1].id);
        } else if (docs.length === 1) {
          setDocAId(docs[0].id);
        }
      } catch (err: any) {
        setError('Failed to fetch documents.');
      } finally {
        setIsLoadingDocs(false);
      }
    };
    fetchDocs();
  }, []);

  const handleCompare = async () => {
    if (!docAId || !docBId) {
      setError('Please select both Document A and Document B to run comparison.');
      return;
    }
    if (docAId === docBId) {
      setError('Please select two distinct documents to compare.');
      return;
    }

    setIsComparing(true);
    setError(null);
    try {
      const data = await comparisonService.compareDocuments(docAId, docBId);
      setComparison(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate document comparison.';
      setError(msg);
    } finally {
      setIsComparing(false);
    }
  };

  if (isLoadingDocs) {
    return <LoadingSpinner label="Initializing Document Comparison Workbench..." />;
  }

  if (documents.length < 2) {
    return (
      <Card className="p-12 text-center max-w-xl mx-auto space-y-4">
        <GitCompare className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Document Comparison Requires 2 Documents</h2>
        <p className="text-xs text-slate-500">
          You currently have {documents.length} document uploaded. Upload a second agreement (e.g. proposed draft vs revised version) to run side-by-side comparison.
        </p>
        <Link to="/upload" className="inline-block pt-2">
          <Button variant="primary" size="md" className="gap-2">
            Upload Second Document <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Document Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="navy">Module 7: Document Comparison</Badge>
            <Badge variant="emerald">Neutral Non-Advice Analysis</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Document Comparison Workbench</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Side-by-side matrix comparison, changed values extraction, single-doc clauses, and neutral review recommendations.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleCompare} isLoading={isComparing} className="gap-2 shadow-sm">
          <ArrowRightLeft className="w-4 h-4" /> Compare Selected Documents
        </Button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Dual Document Selector Bar */}
      <Card className="p-5 bg-slate-900 text-white border-slate-800 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Document A Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block">Document A (Baseline)</span>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id} disabled={d.id === docBId}>
                  {d.filename} ({d.file_type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Document B Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">Document B (Comparison Draft)</span>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id} disabled={d.id === docAId}>
                  {d.filename} ({d.file_type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Comparison Results Area */}
      {isComparing ? (
        <LoadingSpinner label="Running side-by-side legal comparison & difference matrix..." />
      ) : !comparison ? (
        <Card className="p-12 text-center text-slate-500">
          <GitCompare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold">Select Document A and Document B above and click "Compare Selected Documents".</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Banner */}
          <Card className="p-6 bg-nyaya-50/80 border-nyaya-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-nyaya-900">Comparative Summary</span>
              <Badge variant="navy">{comparison.key_differences.length} Factual Differences Identified</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">{comparison.summary}</p>
          </Card>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 space-x-4">
            {[
              { id: 'matrix', label: `Side-by-Side Matrix (${comparison.side_by_side_matrix.length})` },
              { id: 'differences', label: `Key Differences (${comparison.key_differences.length})` },
              { id: 'single', label: `Single Doc Clauses (${comparison.clauses_in_one_doc_only.length})` },
              { id: 'values', label: `Changed Values (${comparison.changed_values.length})` },
              { id: 'recommendations', label: `Review Recommendations (${comparison.review_recommendations.length})` },
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

          {/* Tab 1: Side-by-Side Matrix Table */}
          {activeTab === 'matrix' && (
            <Card className="p-0 overflow-hidden border-slate-200 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                      <th className="p-3.5 w-1/6">Category</th>
                      <th className="p-3.5 w-5/12 border-l border-slate-800">
                        Document A: <span className="text-blue-300 font-bold">{comparison.doc_a_name}</span>
                      </th>
                      <th className="p-3.5 w-5/12 border-l border-slate-800">
                        Document B: <span className="text-amber-300 font-bold">{comparison.doc_b_name}</span>
                      </th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {comparison.side_by_side_matrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-nyaya-950 align-top">{row.category}</td>
                        <td className="p-3.5 align-top border-l border-slate-100 space-y-1">
                          <p className="text-slate-800 leading-relaxed">{row.doc_a_value}</p>
                          <span className="text-[10px] text-slate-500 font-mono block">Source: {row.doc_a_source}</span>
                        </td>
                        <td className="p-3.5 align-top border-l border-slate-100 space-y-1">
                          <p className="text-slate-800 leading-relaxed">{row.doc_b_value}</p>
                          <span className="text-[10px] text-slate-500 font-mono block">Source: {row.doc_b_source}</span>
                        </td>
                        <td className="p-3.5 text-right align-top">
                          <Badge
                            variant={
                              row.status === 'Identical'
                                ? 'emerald'
                                : row.status === 'Modified'
                                ? 'amber'
                                : 'indigo'
                            }
                          >
                            {row.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab 2: Key Differences */}
          {activeTab === 'differences' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Factual Variances &amp; Differences ({comparison.key_differences.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparison.key_differences.map((diff, idx) => (
                  <Card key={idx} className="p-5 space-y-2 border-slate-200">
                    <div className="flex items-center justify-between">
                      <Badge variant="navy">{diff.category}</Badge>
                      <span className="text-[10px] font-mono text-slate-500">{diff.source_a} vs {diff.source_b}</span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{diff.difference}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Clauses in One Document Only */}
          {activeTab === 'single' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Clauses Present in Only One Document ({comparison.clauses_in_one_doc_only.length})
              </h3>
              <div className="space-y-3">
                {comparison.clauses_in_one_doc_only.map((item, idx) => (
                  <Card key={idx} className="p-5 space-y-2 border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="indigo">{item.category}</Badge>
                        <Badge variant="slate">Unique to {item.document}</Badge>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{item.source}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-800 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                      "{item.clause_text}"
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Changed Values */}
          {activeTab === 'values' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Extracted Numerical &amp; Date Value Changes ({comparison.changed_values.length})
              </h3>
              <div className="space-y-3">
                {comparison.changed_values.map((val, idx) => (
                  <Card key={idx} className="p-5 space-y-3 border-amber-200 bg-amber-50/30">
                    <div className="flex items-center justify-between">
                      <Badge variant="amber">{val.category}</Badge>
                      <span className="text-xs font-bold text-slate-900">{val.field}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded border border-amber-200 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Value in {comparison.doc_a_name}</span>
                        <p className="font-bold text-nyaya-950 text-sm">{val.value_in_doc_a}</p>
                        <span className="text-[10px] text-slate-400 font-mono block">Source: {val.source_a}</span>
                      </div>

                      <div className="p-3 bg-white rounded border border-amber-200 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Value in {comparison.doc_b_name}</span>
                        <p className="font-bold text-nyaya-950 text-sm">{val.value_in_doc_b}</p>
                        <span className="text-[10px] text-slate-400 font-mono block">Source: {val.source_b}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Neutral Review Recommendations */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Neutral Review Recommendations for Legal Consultation ({comparison.review_recommendations.length})
              </h3>
              <div className="space-y-4">
                {comparison.review_recommendations.map((rec, idx) => (
                  <Card key={idx} className="p-5 space-y-2 border-slate-200">
                    <div className="flex items-center justify-between">
                      <Badge variant="navy">{rec.category}</Badge>
                      <span className="text-[10px] font-mono text-slate-500">{rec.source_ref_a} • {rec.source_ref_b}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{rec.recommendation}</h4>
                    <p className="text-xs text-slate-600">{rec.why_review_matters}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
