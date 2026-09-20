import { api } from './api';

export interface ClauseItem {
  id: string;
  document_id: string;
  category: string;
  original_text: string;
  simple_explanation: string;
  why_it_matters: string;
  user_responsibility: string;
  potential_concern?: string;
  page_number: number;
  section_ref: string;
  created_at: string;
}

export interface FindingItem {
  id: string;
  document_id: string;
  concern_type: string;
  severity: 'Low' | 'Medium' | 'High';
  title: string;
  explanation: string;
  supporting_text: string;
  page_number: number;
  created_at: string;
}

export interface DocumentAnalysisData {
  document_id: string;
  filename: string;
  document_type: string;
  summary: string;
  parties: string[];
  important_dates: Array<{ label?: string; date?: string; source?: string }>;
  financial_terms: Array<{ term?: string; source?: string }>;
  obligations: Array<{ obligation?: string; party?: string }>;
  rights: Array<{ right?: string; party?: string }>;
  restrictions: Array<{ restriction?: string; party?: string }>;
  clauses: ClauseItem[];
  findings: FindingItem[];
}

export const analysisService = {
  async triggerAnalysis(docId: string): Promise<DocumentAnalysisData> {
    const response = await api.post<DocumentAnalysisData>(`/documents/${docId}/analyze`);
    return response.data;
  },

  async getAnalysis(docId: string): Promise<DocumentAnalysisData> {
    const response = await api.get<DocumentAnalysisData>(`/documents/${docId}/analysis`);
    return response.data;
  },

  async getClauses(docId: string, category?: string): Promise<ClauseItem[]> {
    const response = await api.get<ClauseItem[]>(`/documents/${docId}/clauses`, {
      params: { category },
    });
    return response.data;
  },

  async getFindings(docId: string, severity?: string): Promise<FindingItem[]> {
    const response = await api.get<FindingItem[]>(`/documents/${docId}/findings`, {
      params: { severity },
    });
    return response.data;
  },
};
