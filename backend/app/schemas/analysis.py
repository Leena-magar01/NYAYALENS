import datetime
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ClauseResponse(BaseModel):
    id: str
    document_id: str
    category: str
    original_text: str
    simple_explanation: str
    why_it_matters: str
    user_responsibility: str
    potential_concern: Optional[str] = None
    page_number: Optional[int] = 1
    section_ref: Optional[str] = "General"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FindingResponse(BaseModel):
    id: str
    document_id: str
    concern_type: str
    severity: str
    title: str
    explanation: str
    supporting_text: str
    page_number: Optional[int] = 1
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DocumentAnalysisResponse(BaseModel):
    document_id: str
    filename: str
    document_type: str
    summary: str
    parties: List[str] = []
    important_dates: List[Dict[str, Any]] = []
    financial_terms: List[Dict[str, Any]] = []
    obligations: List[Dict[str, Any]] = []
    rights: List[Dict[str, Any]] = []
    restrictions: List[Dict[str, Any]] = []
    clauses: List[ClauseResponse] = []
    findings: List[FindingResponse] = []
