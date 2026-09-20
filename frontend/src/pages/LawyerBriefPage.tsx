import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Sparkles,
  Printer,
  Download,
  Edit3,
  Save,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { documentsService, DocumentItem } from '../services/documentsService';
import { briefService, LawyerBriefData } from '../services/briefService';
import { Card, Button, Badge, Input } from '../components/common/UIComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const LawyerBriefPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [userConcernsInput, setUserConcernsInput] = useState<string>('');
  const [brief, setBrief] = useState<LawyerBriefData | null>(null);

  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Editable fields state
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSummary, setEditSummary] = useState<string>('');
  const [editConcernsText, setEditConcernsText] = useState<string>('');
  const [editQuestionsText, setEditQuestionsText] = useState<string>('');

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

  const handleGenerate = async () => {
    if (!selectedDocId) return;
    setIsGenerating(true);
    setError(null);
    try {
      const data = await briefService.generateBrief(selectedDocId, userConcernsInput);
      setBrief(data);
      setEditTitle(data.title);
      setEditSummary(data.issue_summary);
      setEditConcernsText(data.concerns_json.join('\n'));
      setEditQuestionsText(data.questions_json.join('\n'));
    } catch (err: any) {
      setError('Failed to generate lawyer consultation brief.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!brief) return;
    setIsSaving(true);
    try {
      const updated = await briefService.updateBrief(brief.id, {
        title: editTitle,
        issue_summary: editSummary,
        user_concerns: editConcernsText.split('\n').map((c) => c.trim()).filter(Boolean),
        questions_for_lawyer: editQuestionsText.split('\n').map((q) => q.trim()).filter(Boolean),
      });
      setBrief(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert('Failed to save brief edits.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = () => {
    if (!brief) return;
    window.print();
  };

  if (isLoadingDocs) {
    return <LoadingSpinner label="Initializing Lawyer Brief Generator..." />;
  }

  if (documents.length === 0) {
    return (
      <Card className="p-12 text-center max-w-xl mx-auto space-y-4">
        <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Lawyer Brief Generator Ready</h2>
        <p className="text-xs text-slate-500">
          Upload a legal agreement to prepare a structured consultation brief for certified legal counsel.
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
            <Badge variant="navy">Module 10: Consultation Brief</Badge>
            <Badge variant="amber">Preparation Aid Only</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Lawyer Consultation Brief</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate a structured consultation document summarizing key dates, clauses, concerns, questions, and evidence.
          </p>
        </div>

        {brief && (
          <div className="flex items-center gap-2">
            <Button
              variant={isEditing ? 'primary' : 'outline'}
              size="sm"
              onClick={() => (isEditing ? handleSaveEdits() : setIsEditing(true))}
              isLoading={isSaving}
              className="gap-1.5 text-xs"
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {isEditing ? 'Save Changes' : 'Edit Brief Content'}
            </Button>

            <Button variant="secondary" size="sm" onClick={handleExportPdf} className="gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" /> Export PDF / Print
            </Button>
          </div>
        )}
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Document Selection & Stated Concerns Input Box */}
      <Card className="p-6 space-y-4 border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-nyaya-700" /> Brief Generation Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Select Target Document
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-nyaya-800"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename} ({d.file_type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              User Stated Concerns (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Concerned about early termination deposit forfeiture and notice period length..."
              value={userConcernsInput}
              onChange={(e) => setUserConcernsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-nyaya-800"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="md" onClick={handleGenerate} isLoading={isGenerating} className="gap-2 shadow-sm">
            <Briefcase className="w-4 h-4" /> Generate Structured Lawyer Brief
          </Button>
        </div>
      </Card>

      {/* Brief Display Container */}
      {isGenerating ? (
        <LoadingSpinner label="Formatting structured consultation brief for legal counsel..." />
      ) : !brief ? (
        <Card className="p-12 text-center text-slate-500">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold">Select a document above and click "Generate Structured Lawyer Brief".</p>
        </Card>
      ) : (
        <Card className="p-8 sm:p-10 space-y-8 bg-white border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0">
          {/* Preparation Aid Safety Disclaimer */}
          <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold uppercase tracking-wider block text-[11px]">
                Preparation Aid &amp; Non-Advice Disclaimer
              </strong>
              <p className="mt-0.5 leading-relaxed text-amber-950">
                This Consultation Brief is an automated preparation document to assist you in organizing factual information and target questions before meeting a certified legal professional. This document does <strong>NOT</strong> constitute legal advice or formal representation.
              </p>
            </div>
          </div>

          {/* Brief Title */}
          <div className="border-b border-slate-200 pb-4">
            {isEditing ? (
              <Input
                label="Brief Document Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            ) : (
              <div>
                <span className="text-[10px] font-bold text-nyaya-700 uppercase tracking-widest">Formal Consultation Brief</span>
                <h2 className="text-2xl font-extrabold text-nyaya-950 mt-1">{brief.title}</h2>
              </div>
            )}
          </div>

          {/* Section 1: Situation Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              1. Executive Situation Summary
            </h3>
            {isEditing ? (
              <textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                rows={4}
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nyaya-800"
              />
            ) : (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{brief.issue_summary}</p>
            )}
          </div>

          {/* Section 2: Important Dates */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-nyaya-700" /> 2. Important Dates &amp; Deadlines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {brief.dates_json.map((d, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-0.5">
                  <span className="font-extrabold text-nyaya-900 uppercase text-[10px] block">{d.event_date}</span>
                  <p className="font-bold text-slate-900">{d.title}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">Source: {d.source_ref}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Important Clauses */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-nyaya-700" /> 3. Important Clauses Summary
            </h3>
            <div className="space-y-2">
              {brief.clauses_json.map((c, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-nyaya-950 font-bold block">{c.category}:</strong>
                    <p className="text-slate-700 mt-0.5">{c.summary}</p>
                  </div>
                  <Badge variant="slate" size="sm" className="shrink-0">{c.source_ref}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: User Stated Concerns */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              4. User Stated Concerns
            </h3>
            {isEditing ? (
              <textarea
                value={editConcernsText}
                onChange={(e) => setEditConcernsText(e.target.value)}
                rows={3}
                placeholder="Enter user concerns (one per line)..."
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nyaya-800"
              />
            ) : (
              <ul className="space-y-1.5 text-xs text-slate-800 list-disc list-inside">
                {brief.concerns_json.map((cn, i) => (
                  <li key={i}>{cn}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Section 5: Target Questions for Lawyer */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-700" /> 5. Target Questions to Ask Legal Professional
            </h3>
            {isEditing ? (
              <textarea
                value={editQuestionsText}
                onChange={(e) => setEditQuestionsText(e.target.value)}
                rows={4}
                placeholder="Enter target questions (one per line)..."
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nyaya-800"
              />
            ) : (
              <ul className="space-y-2 text-xs">
                {brief.questions_json.map((q, i) => (
                  <li key={i} className="p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-lg text-indigo-950 font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">{i + 1}</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Section 6: Evidence to Prepare */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 6. Documents &amp; Evidence to Bring to Consultation
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {brief.evidence_json.map((ev, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};
