import { api } from './api';

export interface DocumentChunkItem {
  id: string;
  document_id: string;
  chunk_index: number;
  text_content: string;
  page_number?: number;
  section_title?: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  ocr_applied: boolean;
  doc_metadata?: Record<string, any>;
  created_at: string;
  chunk_count: number;
}

export interface DocumentDetailItem extends DocumentItem {
  chunks: DocumentChunkItem[];
}

export interface ProcessingStatusItem {
  id: string;
  filename: string;
  status: string;
  ocr_applied: boolean;
  page_count?: number;
  chunk_count: number;
  doc_metadata?: Record<string, any>;
}

export const documentsService = {
  async uploadDocument(file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<DocumentItem>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getDocuments(): Promise<DocumentItem[]> {
    const response = await api.get<DocumentItem[]>('/documents/');
    return response.data;
  },

  async getDocument(id: string): Promise<DocumentDetailItem> {
    const response = await api.get<DocumentDetailItem>(`/documents/${id}`);
    return response.data;
  },

  async getProcessingStatus(id: string): Promise<ProcessingStatusItem> {
    const response = await api.get<ProcessingStatusItem>(`/documents/${id}/processing-status`);
    return response.data;
  },

  async deleteDocument(id: string): Promise<{ message: string; document_id: string }> {
    const response = await api.delete<{ message: string; document_id: string }>(`/documents/${id}`);
    return response.data;
  },
};
