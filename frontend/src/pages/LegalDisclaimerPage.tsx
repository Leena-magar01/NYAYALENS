import React from 'react';
import { ShieldAlert, CheckCircle2, FileText, Lock } from 'lucide-react';
import { Card } from '../components/common/UIComponents';

export const LegalDisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="text-center space-y-2">
        <div className="p-3 bg-slate-900 text-amber-400 rounded-xl inline-block">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Legal Disclaimer &amp; Platform Boundaries</h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Operational framework governing NyayaLens Generative AI legal information and document assistance.
        </p>
      </div>

      <Card className="p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Non-Lawyer Operational Boundary
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            NyayaLens is an automated artificial intelligence software service designed strictly for <strong>educational and informational assistance</strong>. 
            NyayaLens is <strong>not a law firm</strong>, does not provide formal legal representation, and does not employ certified legal counsel to review user submissions.
          </p>
        </div>

        <div className="border-b border-slate-200 pb-4 space-y-3">
          <h3 className="text-base font-bold text-slate-900">Mandatory Service Disclosures</h3>
          <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
            <li><strong>No Guaranteed Legal Outcomes:</strong> NyayaLens will never guarantee that a user will win or lose a dispute or contract negotiation.</li>
            <li><strong>No Binding Advice:</strong> Generated summaries, clause radar items, and potential concern alerts do not constitute binding legal counsel.</li>
            <li><strong>Document Grounding:</strong> All answers provided by NyayaLens are extracted from uploaded source files. Incomplete or ambiguous source text will result in an explicit statement of insufficient evidence.</li>
            <li><strong>Verification Required:</strong> Users are explicitly urged to verify all findings with a qualified advocate or attorney prior to signing legal instruments or initiating legal proceedings.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-nyaya-700" /> Privacy &amp; Data Security Protection
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Uploaded document text is processed exclusively for parsing, clause classification, and user-requested analysis. 
            Files are sandboxed and restricted strictly to your authenticated account.
          </p>
        </div>
      </Card>
    </div>
  );
};
