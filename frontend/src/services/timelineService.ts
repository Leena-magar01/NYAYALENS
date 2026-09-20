import { api } from './api';

export interface TimelineEventItem {
  id: string;
  document_id: string;
  event_date: string;
  title: string;
  description: string;
  category: string;
  source_ref?: string;
  created_at: string;
}

export const timelineService = {
  async getTimeline(docId: string): Promise<TimelineEventItem[]> {
    const response = await api.get<TimelineEventItem[]>(`/documents/${docId}/timeline`);
    return response.data;
  },

  async regenerateTimeline(docId: string): Promise<TimelineEventItem[]> {
    const response = await api.post<TimelineEventItem[]>(`/documents/${docId}/timeline/generate`);
    return response.data;
  },
};
