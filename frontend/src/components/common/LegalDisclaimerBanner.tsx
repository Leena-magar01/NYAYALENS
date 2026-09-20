import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const LegalDisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <p>
          <strong className="font-semibold">Educational Purpose Only:</strong> NyayaLens provides automated document assistance, not binding legal advice. Always verify findings with a qualified legal professional.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-md my-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-slate-800 rounded-lg text-amber-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Important Legal Safety Boundary & Disclosure
          </h4>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
            NyayaLens uses Generative AI to summarize and analyze documents for informational and educational purposes only.
            NyayaLens <strong className="text-white">is not a law firm</strong> and <strong className="text-white">does not provide binding legal representation or legal advice</strong>.
            All clause breakdowns, radar flags, and timeline extractions should be reviewed with a certified legal professional before signing or taking legal action.
          </p>
        </div>
      </div>
    </div>
  );
};
