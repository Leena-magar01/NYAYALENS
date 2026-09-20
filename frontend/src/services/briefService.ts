import { api } from './api';

export interface LawyerBriefData {
  id: string;
  document_id: string;
  user_id: string;
  title: string;
  issue_summary: string;
  dates_json: Array<{ event_date?: string; title?: string; source_ref?: string }>;
  clauses_json: Array<{ category?: string; summary?: string; source_ref?: string }>;
  concerns_json: string[];
  questions_json: string[];
  evidence_json: string[];
  created_at: string;
}

export const briefService = {
  async generateBrief(docId: string, userConcerns?: string): Promise<LawyerBriefData> {
    const response = await api.post<LawyerBriefData>(`/documents/${docId}/brief`, {
      user_concerns: userConcerns,
    });
    return response.data;
  },

  async getBrief(briefId: string): Promise<LawyerBriefData> {
    const response = await api.get<LawyerBriefData>(`/briefs/${briefId}`);
    return response.data;
  },

  async updateBrief(briefId: string, updateData: {
    title?: string;
    issue_summary?: string;
    user_concerns?: string[];
    questions_for_lawyer?: string[];
    evidence_to_prepare?: string[];
  }): Promise<LawyerBriefData> {
    const response = await api.put<LawyerBriefData>(`/briefs/${briefId}`, updateData);
    return response.data;
  },

  getExportPdfUrl(briefId: string): string {
    return `/api/v1/briefs/${briefId}/export-pdf`;
  },
};
