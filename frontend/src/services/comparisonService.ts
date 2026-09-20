import { api } from './api';

export interface MatrixItem {
  category: string;
  doc_a_value: string;
  doc_a_source: string;
  doc_b_value: string;
  doc_b_source: string;
  status: 'Identical' | 'Modified' | 'Present in Doc A Only' | 'Present in Doc B Only';
}

export interface KeyDifferenceItem {
  category: string;
  difference: string;
  source_a: string;
  source_b: string;
}

export interface SingleDocClauseItem {
  category: string;
  document: string;
  clause_text: string;
  source: string;
}

export interface ChangedValueItem {
  category: string;
  field: string;
  value_in_doc_a: string;
  source_a: string;
  value_in_doc_b: string;
  source_b: string;
}

export interface PotentialInconsistencyItem {
  title: string;
  explanation: string;
  source_a: string;
  source_b: string;
}

export interface ReviewRecommendationItem {
  category: string;
  recommendation: string;
  why_review_matters: string;
  source_ref_a: string;
  source_ref_b: string;
}

export interface ComparisonData {
  id: string;
  user_id: string;
  doc_a_id: string;
  doc_b_id: string;
  doc_a_name: string;
  doc_b_name: string;
  summary: string;
  side_by_side_matrix: MatrixItem[];
  key_differences: KeyDifferenceItem[];
  clauses_in_one_doc_only: SingleDocClauseItem[];
  changed_values: ChangedValueItem[];
  potential_inconsistencies: PotentialInconsistencyItem[];
  review_recommendations: ReviewRecommendationItem[];
  created_at: string;
}

export const comparisonService = {
  async compareDocuments(docAId: string, docBId: string): Promise<ComparisonData> {
    const response = await api.post<ComparisonData>('/documents/compare', {
      doc_a_id: docAId,
      doc_b_id: docBId,
    });
    return response.data;
  },

  async getComparison(id: string): Promise<ComparisonData> {
    const response = await api.get<ComparisonData>(`/documents/compare/${id}`);
    return response.data;
  },
};
