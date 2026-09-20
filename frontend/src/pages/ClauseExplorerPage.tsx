import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Radar,
  Filter,
  Search,
  AlertTriangle,
  FileText,
  Sparkles,
  Shield,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { documentsService, DocumentItem } from '../services/documentsService';
import { analysisService, ClauseItem } from '../services/analysisService';
import { Card, Button, Badge, Input } from '../components/common/UIComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const ClauseExplorerPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [clauses, setClauses] = useState<ClauseItem[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Concerns Only'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [isLoadingClauses, setIsLoadingClauses] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'All',
    'Payment',
    'Termination',
    'Renewal',
    'Liability',
    'Penalty',
    'Confidentiality',
    'Dispute Resolution',
    'Intellectual Property',
    'Restrictions',
    'Obligations',
    'Rights',
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
    const fetchClauses = async () => {
      setIsLoadingClauses(true);
      setError(null);
      try {
        const catParam = selectedCategory === 'All' ? undefined : selectedCategory;
        const data = await analysisService.getClauses(selectedDocId, catParam);
        setClauses(data);
      } catch (err: any) {
        setError('Failed to fetch clauses for selected document.');
      } finally {
        setIsLoadingClauses(false);
      }
    };
    fetchClauses();
  }, [selectedDocId, selectedCategory]);

  const filteredClauses = clauses.filter((c) => {
    // Risk filter
    if (riskFilter === 'Concerns Only' && !c.potential_concern) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = c.original_text.toLowerCase() + c.simple_explanation.toLowerCase() + c.category.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  if (isLoadingDocs) {
    return <LoadingSpinner label="Initializing Clause Radar..." />;
  }

  if (documents.length === 0) {
    return (
      <Card className="p-12 text-center max-w-xl mx-auto space-y-4">
        <Radar className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Clause Radar Ready</h2>
        <p className="text-xs text-slate-500">
          Upload a document to categorize clauses by Payment, Termination, Renewal, Liability, and Penalty terms.
        </p>
        <Link to="/upload" className="inline-block pt-2">
          <Button variant="primary" size="md" className="gap-2">
            Upload Document <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="navy">Module 4: Clause Radar</Badge>
            <Badge variant="amber">Legal Safety Compliant</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Clause Radar Workbench</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Filter, inspect, and translate dense legalese into actionable plain language explanations.
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
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Category Radar Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-nyaya-700" /> Filter by Clause Category
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRiskFilter(riskFilter === 'All' ? 'Concerns Only' : 'All')}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${
                riskFilter === 'Concerns Only'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {riskFilter === 'Concerns Only' ? 'Showing Concerns Only' : 'Filter Potential Concerns'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                selectedCategory === cat
                  ? 'bg-nyaya-900 text-white border-nyaya-950 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          placeholder="Search clauses or keyword (e.g. rent, notice, penalty)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Clause Cards Stream */}
      {isLoadingClauses ? (
        <LoadingSpinner label="Filtering Clause Radar data..." />
      ) : filteredClauses.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          <Radar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold">No clauses found matching current category or filter.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredClauses.length} extracted clauses</span>
            <span>Unaltered Original vs Plain Language Comparison</span>
          </div>

          <div className="space-y-6">
            {filteredClauses.map((clause) => (
              <Card key={clause.id} className="p-6 space-y-4 border-slate-200 hover:border-slate-300">
                {/* Header Tag */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="navy" size="md">{clause.category}</Badge>
                    <Badge variant="slate">Page {clause.page_number} • Section: {clause.section_ref}</Badge>
                  </div>

                  {clause.potential_concern && (
                    <Badge variant="amber" className="gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Potential Concern Identified
                    </Badge>
                  )}
                </div>

                {/* Side-by-Side Clause Radar Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left: Original Legal Language */}
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Original Clause (Unaltered)
                      </span>
                    </div>
                    <p className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre-wrap">
                      "{clause.original_text}"
                    </p>
                  </div>

                  {/* Right: Plain Language Simplification */}
                  <div className="p-4 bg-nyaya-50/70 rounded-xl space-y-3 border border-nyaya-200/80 text-xs">
                    <div>
                      <strong className="text-nyaya-950 font-bold block text-sm">Simple Explanation:</strong>
                      <p className="text-slate-800 mt-1 leading-relaxed">{clause.simple_explanation}</p>
                    </div>

                    <div>
                      <strong className="text-nyaya-900 font-semibold block text-xs">Why It Matters:</strong>
                      <p className="text-slate-600 mt-0.5">{clause.why_it_matters}</p>
                    </div>

                    <div>
                      <strong className="text-nyaya-900 font-semibold block text-xs">User Responsibility:</strong>
                      <p className="text-slate-600 mt-0.5">{clause.user_responsibility}</p>
                    </div>

                    {clause.potential_concern && (
                      <div className="p-3 bg-amber-100/90 border border-amber-300 rounded-lg text-amber-950 mt-2 space-y-0.5">
                        <strong className="font-bold flex items-center gap-1 text-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" /> Potential Concern to Review:
                        </strong>
                        <p className="text-xs text-amber-950 font-medium">{clause.potential_concern}</p>
                        <p className="text-[10px] text-amber-800 italic mt-1">
                          Consider verifying this provision with a qualified legal professional.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
