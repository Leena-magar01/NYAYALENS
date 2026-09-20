import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  FileCheck,
  Sparkles,
  RefreshCw,
  FileText,
  HelpCircle,
  ArrowRight,
  Square
} from 'lucide-react';
import { documentsService, DocumentItem } from '../services/documentsService';
import { checklistService, ActionItem } from '../services/checklistService';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const ActionChecklistPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [items, setItems] = useState<ActionItem[]>([]);
  
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    const fetchChecklist = async () => {
      setIsLoadingChecklist(true);
      setError(null);
      try {
        const data = await checklistService.getChecklist(selectedDocId);
        setItems(data);
      } catch (err: any) {
        setError('Failed to fetch checklist items.');
      } finally {
        setIsLoadingChecklist(false);
      }
    };
    fetchChecklist();
  }, [selectedDocId]);

  const handleToggle = async (itemId: string) => {
    // Optimistic UI update
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, completed: !it.completed } : it))
    );
    try {
      await checklistService.toggleItem(itemId);
    } catch (err: any) {
      console.error('Failed to toggle item:', err);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedDocId) return;
    setIsLoadingChecklist(true);
    setError(null);
    try {
      const data = await checklistService.regenerateChecklist(selectedDocId);
      setItems(data);
    } catch (err: any) {
      setError('Failed to regenerate checklist.');
    } finally {
      setIsLoadingChecklist(false);
    }
  };

  const docDerivedItems = items.filter((it) => it.source_type === 'Document-Derived Action');
  const generalSuggestionItems = items.filter((it) => it.source_type === 'General Preparation Suggestion');

  const completedCount = items.filter((it) => it.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  if (isLoadingDocs) {
    return <LoadingSpinner label="Initializing Action Checklist..." />;
  }

  if (documents.length === 0) {
    return (
      <Card className="p-12 text-center max-w-xl mx-auto space-y-4">
        <CheckSquare className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Actionable Checklist Workbench</h2>
        <p className="text-xs text-slate-500">
          Upload a legal document to generate step-by-step preparation checklists and document-derived action items.
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
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="navy">Module 9: Action Checklist</Badge>
            <Badge variant="emerald">Source Type Separated</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Actionable Next-Steps Checklist</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track contractual obligations, preparation tasks, and general informational suggestions.
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

          <Button variant="outline" size="sm" onClick={handleRegenerate} isLoading={isLoadingChecklist} className="gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5 text-nyaya-700" /> Refresh Items
          </Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Completion Progress Bar */}
      {items.length > 0 && (
        <Card className="p-5 bg-nyaya-950 text-white border-nyaya-900 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Preparation Completion Status
            </h3>
            <p className="text-xs text-slate-300">
              {completedCount} of {items.length} tasks completed ({progressPercent}%)
            </p>
          </div>

          <div className="w-full sm:w-64 bg-slate-800 rounded-full h-3.5 border border-slate-700 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>
      )}

      {isLoadingChecklist ? (
        <LoadingSpinner label="Generating actionable preparation items..." />
      ) : items.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold">No action items found for selected document.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Document-Derived Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-nyaya-700" /> Document-Derived Actions
              </h3>
              <Badge variant="navy">{docDerivedItems.length} Tasks</Badge>
            </div>

            <div className="space-y-3">
              {docDerivedItems.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`p-4 border transition-all ${
                    item.completed ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-0.5 shrink-0 text-nyaya-800 hover:text-nyaya-950 transition-colors">
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-relaxed ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.task}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant="slate" size="sm">{item.category}</Badge>
                        <Badge variant={item.priority === 'High' ? 'rose' : 'amber'} size="sm">
                          {item.priority} Priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Column 2: General Preparation Suggestions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" /> General Preparation Suggestions
              </h3>
              <Badge variant="indigo">{generalSuggestionItems.length} Suggestions</Badge>
            </div>

            <div className="space-y-3">
              {generalSuggestionItems.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`p-4 border transition-all ${
                    item.completed ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-indigo-50/40 border-indigo-200/80 hover:border-indigo-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-0.5 shrink-0 text-indigo-700 hover:text-indigo-900 transition-colors">
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-indigo-300" />
                      )}
                    </button>
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-relaxed ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.task}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant="indigo" size="sm">{item.category}</Badge>
                        <Badge variant="slate" size="sm">Informational Suggestion</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
