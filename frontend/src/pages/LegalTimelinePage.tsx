import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  RefreshCw,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { documentsService, DocumentItem } from '../services/documentsService';
import { timelineService, TimelineEventItem } from '../services/timelineService';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const LegalTimelinePage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [timeline, setTimeline] = useState<TimelineEventItem[]>([]);
  
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState<boolean>(false);
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
    const fetchTimeline = async () => {
      setIsLoadingTimeline(true);
      setError(null);
      try {
        const data = await timelineService.getTimeline(selectedDocId);
        setTimeline(data);
      } catch (err: any) {
        setError('Failed to fetch timeline events.');
      } finally {
        setIsLoadingTimeline(false);
      }
    };
    fetchTimeline();
  }, [selectedDocId]);

  const handleRegenerate = async () => {
    if (!selectedDocId) return;
    setIsLoadingTimeline(true);
    setError(null);
    try {
      const data = await timelineService.regenerateTimeline(selectedDocId);
      setTimeline(data);
    } catch (err: any) {
      setError('Failed to regenerate timeline.');
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  if (isLoadingDocs) {
    return <LoadingSpinner label="Initializing Legal Timeline..." />;
  }

  if (documents.length === 0) {
    return (
      <Card className="p-12 text-center max-w-xl mx-auto space-y-4">
        <CalendarDays className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Legal Timeline Generator</h2>
        <p className="text-xs text-slate-500">
          Upload a document to automatically extract payment deadlines, notice windows, and expiration dates.
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
            <Badge variant="navy">Module 8: Chronological Timeline</Badge>
            <Badge variant="emerald">Source Citations Enforced</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Legal Timeline</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chronological overview of effective dates, payment milestones, notice deadlines, and expiration dates.
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

          <Button variant="outline" size="sm" onClick={handleRegenerate} isLoading={isLoadingTimeline} className="gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5 text-nyaya-700" /> Refresh Timeline
          </Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Timeline Stream */}
      {isLoadingTimeline ? (
        <LoadingSpinner label="Extracting chronological dates & milestones..." />
      ) : timeline.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold">No contractual dates found in selected document.</p>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 space-y-8 border-slate-200 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-nyaya-700" /> Chronological Milestone Progression
            </h3>
            <span className="text-xs font-mono text-slate-500">{timeline.length} Key Dates Extracted</span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-nyaya-200">
            {timeline.map((event, idx) => (
              <div key={event.id} className="relative group">
                {/* Vertical Node Indicator */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-nyaya-900 border-4 border-white text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                  {idx + 1}
                </div>

                <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-2 hover:border-nyaya-300 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-nyaya-900 uppercase tracking-wider bg-nyaya-100 px-2.5 py-1 rounded-md">
                      {event.event_date}
                    </span>
                    <Badge variant={event.category === 'Notice Deadline' ? 'amber' : event.category === 'Expiration' ? 'rose' : 'slate'}>
                      {event.category}
                    </Badge>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{event.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>

                  {event.source_ref && (
                    <div className="pt-2 flex items-center gap-1 text-[11px] text-slate-500 border-t border-slate-200/60 font-mono">
                      <BookOpen className="w-3.5 h-3.5 text-nyaya-600" />
                      <span>Source Citation: {event.source_ref}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
