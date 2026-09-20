import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileSearch,
  Radar,
  MessageSquareText,
  GitCompare,
  CalendarDays,
  CheckSquare,
  Briefcase,
  History,
  Settings,
  ShieldCheck,
  Scale,
  Globe
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();

  const navGroups = [
    {
      title: 'CORE PLATFORM',
      items: [
        { name: t('nav_dashboard'), path: '/dashboard', icon: LayoutDashboard },
        { name: t('nav_upload'), path: '/upload', icon: UploadCloud },
        { name: t('nav_analysis'), path: '/analysis', icon: FileSearch },
        { name: t('nav_clauses'), path: '/clauses', icon: Radar },
        { name: t('nav_ask'), path: '/ask', icon: MessageSquareText },
      ],
    },
    {
      title: 'INTELLIGENCE TOOLS',
      items: [
        { name: t('nav_compare'), path: '/compare', icon: GitCompare },
        { name: t('nav_timeline'), path: '/timeline', icon: CalendarDays },
        { name: t('nav_checklist'), path: '/checklist', icon: CheckSquare },
        { name: t('nav_brief'), path: '/brief', icon: Briefcase },
      ],
    },
    {
      title: 'ACCOUNT & SAFETY',
      items: [
        { name: t('nav_history'), path: '/history', icon: History },
        { name: t('nav_settings'), path: '/settings', icon: Settings },
        { name: t('nav_disclaimer'), path: '/disclaimer', icon: ShieldCheck },
      ],
    },
  ];

  const langLabel = language === 'hi' ? 'हिन्दी (Hindi)' : language === 'mr' ? 'मराठी (Marathi)' : 'English';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-slate-800 shrink-0">
          <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-2.5 font-bold text-lg text-white">
            <div className="p-1.5 bg-blue-600 rounded-md text-white">
              <Scale className="w-5 h-5" />
            </div>
            <span>
              Nyaya<span className="text-blue-400 font-extrabold">Lens</span>
            </span>
          </NavLink>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm font-semibold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Multilingual Support Active Banner */}
        <div className="p-4 m-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Globe className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Multilingual Engine</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-tight">
            Active Mode: <strong className="text-emerald-400 font-semibold">{langLabel}</strong>
          </p>
        </div>
      </aside>
    </>
  );
};
