import { api } from './api';

export interface SourceCitationItem {
  page_number: number;
  section_title: string;
  excerpt: string;
}

export interface QuestionAnswerItem {
  id: string;
  document_id: string;
  user_id: string;
  question: string;
  answer: string;
  confidence_score: number;
  grounded: boolean;
  sources_json?: SourceCitationItem[];
  created_at: string;
}

export const qaService = {
  async askQuestion(docId: string, question: string): Promise<QuestionAnswerItem> {
    const response = await api.post<QuestionAnswerItem>(`/documents/${docId}/ask`, { question });
    return response.data;
  },

  async getQuestionHistory(docId: string): Promise<QuestionAnswerItem[]> {
    const response = await api.get<QuestionAnswerItem[]>(`/documents/${docId}/questions`);
    return response.data;
  },

  async clearQuestionHistory(docId: string): Promise<{ message: string; document_id: string }> {
    const response = await api.delete<{ message: string; document_id: string }>(`/documents/${docId}/questions`);
    return response.data;
  },
};
