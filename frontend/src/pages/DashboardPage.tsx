import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Calendar,
  HelpCircle,
  UploadCloud,
  FileSearch,
  Radar,
  GitCompare,
  Briefcase,
  CheckSquare,
  ArrowUpRight,
  Plus,
  Clock
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types';
import { Card, Button, Badge } from '../components/common/UIComponents';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err: any) {
        console.error('Failed to load dashboard statistics:', err);
        setError('Failed to fetch dashboard data. Make sure backend service is active.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Fetching your document statistics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Document Intelligence Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time overview of uploaded agreements, potential concerns, deadlines, and legal briefs.
          </p>
        </div>
        <Link to="/upload">
          <Button variant="primary" size="md" className="gap-2 shadow-sm">
            <UploadCloud className="w-4 h-4" /> Upload Document
          </Button>
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-nyaya-100 text-nyaya-900 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Documents Analyzed</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats?.documents_analyzed ?? 0}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Findings</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats?.total_findings ?? 0}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-900 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upcoming Deadlines</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats?.upcoming_deadlines ?? 0}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-900 rounded-xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Questions Asked</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats?.questions_asked ?? 0}</h3>
          </div>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Quick Workbench Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Upload Document', icon: UploadCloud, path: '/upload', color: 'bg-blue-50 text-blue-800' },
            { label: 'Clause Radar', icon: Radar, path: '/clauses', color: 'bg-indigo-50 text-indigo-800' },
            { label: 'Ask RAG', icon: HelpCircle, path: '/ask', color: 'bg-emerald-50 text-emerald-800' },
            { label: 'Compare Documents', icon: GitCompare, path: '/compare', color: 'bg-amber-50 text-amber-800' },
            { label: 'Action Checklist', icon: CheckSquare, path: '/checklist', color: 'bg-purple-50 text-purple-800' },
            { label: 'Lawyer Brief', icon: Briefcase, path: '/brief', color: 'bg-rose-50 text-rose-800' },
          ].map((act, i) => {
            const Icon = act.icon;
            return (
              <Link key={i} to={act.path}>
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 text-center hover:shadow-card-hover hover:border-slate-300 transition-all flex flex-col items-center gap-2 group">
                  <div className={`p-2.5 rounded-lg ${act.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{act.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Important Findings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-nyaya-700" /> Recent Documents
            </h3>
            <Link to="/history" className="text-xs font-semibold text-nyaya-700 hover:underline flex items-center gap-1">
              View History <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!stats?.recent_documents || stats.recent_documents.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No documents uploaded yet</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                Upload a rental agreement, employment contract, or service agreement to start analysis.
              </p>
              <Link to="/upload" className="inline-block mt-3">
                <Button size="sm" variant="outline" className="gap-1 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Upload First Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="pb-2">Filename</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recent_documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-medium text-slate-900">{doc.filename}</td>
                      <td className="py-3 uppercase text-slate-500">{doc.file_type}</td>
                      <td className="py-3">
                        <Badge variant={doc.status === 'analyzed' ? 'emerald' : 'amber'}>
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-slate-500">{doc.uploaded_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Important Findings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Recent Potential Concerns
            </h3>
            <Link to="/clauses" className="text-xs font-semibold text-nyaya-700 hover:underline flex items-center gap-1">
              Explore Radar <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!stats?.important_findings || stats.important_findings.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No concerns flagged</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                Once documents are processed, ambiguous clauses, broad obligations, and penalties will be flagged here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.important_findings.map((finding) => (
                <div key={finding.id} className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{finding.title}</span>
                    <Badge variant={finding.severity === 'High' ? 'rose' : 'amber'}>
                      {finding.severity} Severity
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700">{finding.explanation}</p>
                  <p className="text-[10px] text-slate-500 italic">Source Document: {finding.doc_name}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
