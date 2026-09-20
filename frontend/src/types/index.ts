export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RecentDocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  uploaded_at: string;
}

export interface ImportantFindingItem {
  id: string;
  doc_id: string;
  doc_name: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High';
  explanation: string;
}

export interface DashboardStats {
  documents_analyzed: number;
  total_findings: number;
  upcoming_deadlines: number;
  questions_asked: number;
  recent_documents: RecentDocumentItem[];
  important_findings: ImportantFindingItem[];
}
