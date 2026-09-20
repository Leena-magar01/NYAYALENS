import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Globe,
  Cpu,
  ShieldCheck,
  Key,
  CheckCircle2,
  Lock,
  FileText,
  Save,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../utils/i18n';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [detailLevel, setDetailLevel] = useState<string>('comprehensive');
  const [enableAuditLog, setEnableAuditLog] = useState<boolean>(true);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice('Settings & platform preferences saved successfully.');
    setTimeout(() => setSavedNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="navy">Account Workspace</Badge>
          <Badge variant="emerald">Security System Active</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-nyaya-700" />
          Workspace &amp; Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage user profile information, language preferences, AI engine controls, and security audit settings.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* User Profile Card */}
        <Card className="p-6 border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 bg-nyaya-50 text-nyaya-800 rounded-xl">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">User Profile</h3>
              <p className="text-xs text-slate-500">Authenticated user details and access role</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.full_name || 'Legal Analyst User'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'user@nyayalens.org'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
              <input
                type="text"
                disabled
                value="Individual Analyst / Non-Lawyer User"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Security Isolation</label>
              <input
                type="text"
                disabled
                value="JWT Auth Active (User Isolated DB Data)"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Multilingual & Regional Preferences */}
        <Card className="p-6 border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Multilingual &amp; UI Language</h3>
              <p className="text-xs text-slate-500">Select preferred language for navigation &amp; AI explanations</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Display &amp; Explanation Language</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { code: 'en', label: 'English', desc: 'Default legal analysis language' },
                { code: 'hi', label: 'हिन्दी (Hindi)', desc: 'हिंदी व्याख्या व इंटरफेस' },
                { code: 'mr', label: 'मराठी (Marathi)', desc: 'मराठी स्पष्टीकरण व इंटरफेस' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code as Language)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    language === item.code
                      ? 'border-nyaya-700 bg-nyaya-50/80 ring-2 ring-nyaya-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{item.label}</span>
                    {language === item.code && <CheckCircle2 className="w-4 h-4 text-nyaya-700" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* AI Engine & Processing Settings */}
        <Card className="p-6 border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Intelligence Engine Status</h3>
              <p className="text-xs text-slate-500">LLM service providers and fallback NLP pipeline status</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Gemini 2.5 Flash / OpenAI Engine</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Connected / Auto-Fallback Ready
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                NyayaLens automatically utilizes Gemini 2.5 Flash structured output APIs when API keys are available, and falls back seamlessly to deterministic rule-augmented NLP pipelines.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Analysis Output Detail Level</label>
              <select
                value={detailLevel}
                onChange={(e) => setDetailLevel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nyaya-500"
              >
                <option value="comprehensive">Comprehensive (All 14 clause categories &amp; full risk radar)</option>
                <option value="summary">Executive Summary Only (Key dates, parties &amp; financial terms)</option>
                <option value="concerns">Focus on Potential Concerns &amp; Information Gaps</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Security & Audit Controls */}
        <Card className="p-6 border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Security, Audit &amp; Safety Boundary</h3>
              <p className="text-xs text-slate-500">Rate limiting, prompt injection defense, and legal disclosures</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Structured Security Audit Logging</p>
                <p className="text-slate-500">Log document processing steps and API authentication events</p>
              </div>
              <input
                type="checkbox"
                checked={enableAuditLog}
                onChange={(e) => setEnableAuditLog(e.target.checked)}
                className="w-4 h-4 text-nyaya-600 rounded border-slate-300 focus:ring-nyaya-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Sliding Window Rate Limiter</p>
                <p className="text-slate-500">Protection against automated API abuse (60 requests/min limit)</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                Legal Safety Boundary Enforced
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                NyayaLens strictly provides legal information and preparation assistance. All AI outputs use neutral phrasing (&quot;Potential Concern&quot;, &quot;Requires Review&quot;) and explicitly disclaim binding legal counsel.
              </p>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="md" className="gap-2">
            <Save className="w-4 h-4" /> Save Workspace Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
