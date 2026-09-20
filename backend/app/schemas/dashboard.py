from pydantic import BaseModel
from typing import List, Optional

class RecentDocumentItem(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    status: str
    uploaded_at: str

class ImportantFindingItem(BaseModel):
    id: str
    doc_id: str
    doc_name: str
    title: str
    severity: str
    explanation: str

class DashboardStatsResponse(BaseModel):
    documents_analyzed: int
    total_findings: int
    upcoming_deadlines: int
    questions_asked: int
    recent_documents: List[RecentDocumentItem]
    important_findings: List[ImportantFindingItem]
