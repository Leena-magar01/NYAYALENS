import React from 'react';
import { Scale, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white mb-3">
              <div className="p-1.5 bg-blue-600 rounded text-white">
                <Scale className="w-5 h-5" />
              </div>
              <span>
                Nyaya<span className="text-blue-400">Lens</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              NyayaLens is an AI-powered legal information and document assistance platform. Designed for educational clarity, entity extraction, clause analysis, and preparing users for certified professional legal consultation.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Platform Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/upload" className="hover:text-white transition-colors">Document Analyzer</Link></li>
              <li><Link to="/clauses" className="hover:text-white transition-colors">Clause Radar</Link></li>
              <li><Link to="/ask" className="hover:text-white transition-colors">Ask Document (RAG)</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Document Comparison</Link></li>
              <li><Link to="/timeline" className="hover:text-white transition-colors">Legal Timeline</Link></li>
              <li><Link to="/brief" className="hover:text-white transition-colors">Lawyer Brief Generator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Legal &amp; Trust</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/disclaimer" className="hover:text-white transition-colors flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-amber-400" /> Full Disclaimer</Link></li>
              <li><span className="text-slate-500">Non-Lawyer Boundary</span></li>
              <li><span className="text-slate-500">No Legal Outcomes Guaranteed</span></li>
              <li><span className="text-slate-500">Educational Use Only</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} NyayaLens AI Legal Information Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/disclaimer" className="hover:text-slate-300 transition-colors">Terms &amp; Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
