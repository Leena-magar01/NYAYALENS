import datetime
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ComparisonRequest(BaseModel):
    doc_a_id: str
    doc_b_id: str

class ComparisonResponse(BaseModel):
    id: str
    user_id: str
    doc_a_id: str
    doc_b_id: str
    doc_a_name: str
    doc_b_name: str
    summary: str
    side_by_side_matrix: List[Dict[str, Any]] = []
    key_differences: List[Dict[str, Any]] = []
    clauses_in_one_doc_only: List[Dict[str, Any]] = []
    changed_values: List[Dict[str, Any]] = []
    potential_inconsistencies: List[Dict[str, Any]] = []
    review_recommendations: List[Dict[str, Any]] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True
