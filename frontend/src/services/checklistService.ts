import { api } from './api';

export interface ActionItem {
  id: string;
  document_id?: string;
  user_id: string;
  task: string;
  category: string;
  source_type: 'Document-Derived Action' | 'General Preparation Suggestion';
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  created_at: string;
}

export const checklistService = {
  async getChecklist(docId: string): Promise<ActionItem[]> {
    const response = await api.get<ActionItem[]>(`/documents/${docId}/checklist`);
    return response.data;
  },

  async regenerateChecklist(docId: string): Promise<ActionItem[]> {
    const response = await api.post<ActionItem[]>(`/documents/${docId}/checklist/generate`);
    return response.data;
  },

  async toggleItem(itemId: string): Promise<{ id: string; completed: boolean; message: string }> {
    const response = await api.patch<{ id: string; completed: boolean; message: string }>(`/checklist/${itemId}/toggle`);
    return response.data;
  },
};
