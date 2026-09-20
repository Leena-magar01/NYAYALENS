import React from 'react';
import {
  UploadCloud,
  FileSearch,
  Radar,
  MessageSquareText,
  GitCompare,
  CalendarDays,
  CheckSquare,
  Briefcase,
  History,
  Settings as SettingsIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, Button, Badge } from '../components/common/UIComponents';

interface PlaceholderProps {
  title: string;
  description: string;
  moduleName: string;
  icon: React.ElementType;
  phaseReadyText: string;
}

const GenericModuleShell: React.FC<PlaceholderProps> = ({
  title,
  description,
  moduleName,
  icon: Icon,
  phaseReadyText,
}) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="navy">{moduleName}</Badge>
          <Badge variant="indigo">Foundation Active</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">{description}</p>
      </div>
    </div>

    <Card className="p-8 text-center space-y-4 border-slate-200 shadow-sm">
      <div className="p-4 bg-nyaya-50 text-nyaya-800 rounded-2xl inline-block">
        <Icon className="w-10 h-10" />
      </div>
      <div className="max-w-md mx-auto space-y-2">
        <h3 className="text-lg font-bold text-slate-900">{moduleName} Shell Ready</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{phaseReadyText}</p>
      </div>
      <div className="pt-2">
        <Button variant="outline" size="sm" className="gap-2 text-xs cursor-default">
          <Sparkles className="w-3.5 h-3.5 text-nyaya-600" /> Database &amp; API Routes Configured
        </Button>
      </div>
    </Card>
  </div>
);

export const UploadDocumentPage: React.FC = () => (
  <GenericModuleShell
    title="Upload Legal Document"
    description="Support for PDF, DOCX, and TXT files with drag-and-drop validation and OCR pre-processing."
    moduleName="Module 1: Document Upload"
    icon={UploadCloud}
    phaseReadyText="The file upload foundation, validation schema, and storage APIs are structured. Full drag-and-drop parser activates in Phase 2."
  />
);

export const DocumentAnalysisPage: React.FC = () => (
  <GenericModuleShell
    title="Legal Document Analyzer"
    description="Automated extraction of parties, monetary amounts, obligations, deadlines, and rights."
    moduleName="Module 2: Document Analyzer"
    icon={FileSearch}
    phaseReadyText="Structured schema models for entity extractions are fully synced with FastAPI backend."
  />
);

export const ClauseExplorerPage: React.FC = () => (
  <GenericModuleShell
    title="Clause Radar &amp; Simplification"
    description="Categorize clauses into payment, liability, termination, and detect potential concerns."
    moduleName="Module 3 & 4: Clause Radar"
    icon={Radar}
    phaseReadyText="Clause classification taxonomy (Payment, Renewal, Liability, IP) registered in database models."
  />
);

export const AskDocumentPage: React.FC = () => (
  <GenericModuleShell
    title="Ask Your Document (RAG Q&amp;A)"
    description="Source-grounded legal question answering with strict page citation and confidence scores."
    moduleName="Module 6: RAG Q&A"
    icon={MessageSquareText}
    phaseReadyText="QuestionAnswer ORM database schemas and vector search foundation ready for embeddings integration."
  />
);

export const DocumentComparisonPage: React.FC = () => (
  <GenericModuleShell
    title="Document Comparison Workbench"
    description="Side-by-side comparison matrix of Document A and Document B."
    moduleName="Module 7: Document Comparison"
    icon={GitCompare}
    phaseReadyText="DocumentComparison table schemas and side-by-side diff layout container ready."
  />
);

export const LegalTimelinePage: React.FC = () => (
  <GenericModuleShell
    title="Legal Timeline Extractor"
    description="Chronological view of payment dates, notice periods, renewal windows, and expiration dates."
    moduleName="Module 8: Legal Timeline"
    icon={CalendarDays}
    phaseReadyText="TimelineEvent database model configured to store extracted event dates and source references."
  />
);

export const ActionChecklistPage: React.FC = () => (
  <GenericModuleShell
    title="Actionable Next-Steps Checklist"
    description="Generate document-derived action items and preparation tasks."
    moduleName="Module 9: Action Checklist"
    icon={CheckSquare}
    phaseReadyText="ActionItem data schema ready to track task priorities, completion status, and source types."
  />
);

export const LawyerBriefPage: React.FC = () => (
  <GenericModuleShell
    title="Lawyer Brief Generator"
    description="Prepare structured consultation briefs for certified legal counsel."
    moduleName="Module 10: Lawyer Brief"
    icon={Briefcase}
    phaseReadyText="LawyerBrief structured schema (Issue, Key Dates, Clauses, Questions) initialized in database."
  />
);

export const DocumentHistoryPage: React.FC = () => (
  <GenericModuleShell
    title="Document History &amp; Archive"
    description="Manage previous document uploads, past analyses, and export logs."
    moduleName="Module 12: Document History"
    icon={History}
    phaseReadyText="Document audit history API endpoints configured with user-isolated data security."
  />
);

export const SettingsPage: React.FC = () => (
  <GenericModuleShell
    title="Workspace &amp; Account Settings"
    description="Configure user profile, preferences, and API keys."
    moduleName="Module 13: Settings"
    icon={SettingsIcon}
    phaseReadyText="User profile settings and authentication configuration dashboard active."
  />
);
