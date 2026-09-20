import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Zap,
  HelpCircle,
  GitCompare,
  Calendar,
  CheckCircle,
  Briefcase,
  ArrowRight,
  Lock,
  Globe,
  Award
} from 'lucide-react';
import { Button, Card, Badge } from '../components/common/UIComponents';
import { LegalDisclaimerBanner } from '../components/common/LegalDisclaimerBanner';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: 'Automated Document Analysis',
      description: 'Extract parties, monetary terms, key obligations, rights, termination clauses, and penalties automatically.',
    },
    {
      icon: Zap,
      title: 'Clause Radar & Simplification',
      description: 'Translate dense legalese into plain language with original clause comparison, why it matters, and potential concerns.',
    },
    {
      icon: ShieldCheck,
      title: 'Potential Concern Detector',
      description: 'Spot ambiguous terms, one-sided provisions, automatic renewals, long notice periods, and conflicting obligations.',
    },
    {
      icon: HelpCircle,
      title: 'Grounded RAG Q&A',
      description: 'Ask direct questions to your agreement with strict source page citations and zero hallucinated answers.',
    },
    {
      icon: GitCompare,
      title: 'Document Comparison',
      description: 'Side-by-side comparison matrix of two contracts highlighting key differences and review-worthy discrepancies.',
    },
    {
      icon: Calendar,
      title: 'Legal Timeline Generator',
      description: 'Chronological timeline of critical payment due dates, notice windows, renewal deadlines, and expiration dates.',
    },
    {
      icon: CheckCircle,
      title: 'Actionable Next-Steps Checklist',
      description: 'Step-by-step preparation checklist distinguishing document-derived requirements from informational advice.',
    },
    {
      icon: Briefcase,
      title: 'Lawyer Brief Generator',
      description: 'Structured brief summarizing your case, key dates, user concerns, and target questions for professional consultation.',
    },
  ];

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <Badge variant="navy" size="md" className="gap-1.5 uppercase tracking-wider font-semibold">
            <ShieldCheck className="w-4 h-4 text-nyaya-700" />
            AI-Powered Legal Information &amp; Document Intelligence
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-nyaya-950 tracking-tight leading-tight">
            Understand Legal Contracts with <span className="text-nyaya-600">Confidence &amp; Clarity</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
            NyayaLens simplifies complex agreements, extracts critical obligations, flags potential concerns, and helps you prepare for professional legal consultations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 py-3.5 shadow-md">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                Sign In to Workspace
              </Button>
            </Link>
          </div>

          <div className="pt-2 text-xs text-slate-500 flex items-center justify-center gap-6">
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-400" /> Encrypted &amp; Isolated Files</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" /> Multilingual Architecture Ready</span>
            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-slate-400" /> Non-Lawyer Safety Guarded</span>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <LegalDisclaimerBanner />
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-nyaya-950">Comprehensive Legal Document Assistance</h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Everything you need to navigate agreements, detect potential concerns, and prepare for legal meetings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="hover:-translate-y-1 transition-all duration-200 border-slate-200">
                <div className="p-3 bg-nyaya-50 text-nyaya-800 rounded-lg inline-block mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works Workflow */}
      <section id="how-it-works" className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-nyaya-950">How NyayaLens Works</h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Four simple steps from unreadable legal document to organized, actionable intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { step: '01', title: 'Upload Document', desc: 'Drag and drop PDF, DOCX, or scanned files into the secure workbench.' },
              { step: '02', title: 'AI Legal Analysis', desc: 'Extract clauses, obligations, rights, penalties, and potential concerns.' },
              { step: '03', title: 'Interact & Compare', desc: 'Ask grounded questions, view legal timelines, or compare two documents.' },
              { step: '04', title: 'Prepare & Consult', desc: 'Export an actionable checklist and a structured brief for your attorney.' },
            ].map((st, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
                <div className="text-3xl font-extrabold text-nyaya-300 mb-2">{st.step}</div>
                <h3 className="text-base font-bold text-nyaya-950 mb-1">{st.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-nyaya-950 text-white rounded-2xl p-8 sm:p-12 shadow-xl border border-nyaya-800 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Decode Your Legal Documents?</h2>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
            Join NyayaLens today to bring legal clarity, eliminate ambiguity, and prepare effectively for professional advice.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button size="lg" className="bg-white text-nyaya-950 hover:bg-slate-100 font-bold px-8 py-3.5">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
