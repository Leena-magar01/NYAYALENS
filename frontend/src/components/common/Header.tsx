import React, { useState } from 'react';
import { Menu, LogOut, User as UserIcon, Shield, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../utils/i18n';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);

  const languages: { code: Language; label: string; status: string }[] = [
    { code: 'en', label: 'English', status: 'Active' },
    { code: 'hi', label: 'हिन्दी (Hindi)', status: 'Active' },
    { code: 'mr', label: 'मराठी (Marathi)', status: 'Active' },
  ];

  const currentLangLabel = languages.find((l) => l.code === language)?.label || 'English';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Non-Advice Legal Safety Mode Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Multilingual Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Select Language"
            aria-expanded={isLangOpen}
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentLangLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                    language === lang.code ? 'font-bold text-nyaya-700 bg-nyaya-50' : 'text-slate-700'
                  }`}
                >
                  <span>{lang.label}</span>
                  <span className="text-[10px] text-emerald-600 font-medium font-mono">{lang.status}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-nyaya-900 text-white flex items-center justify-center font-bold text-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.full_name || 'Legal Analyst'}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
