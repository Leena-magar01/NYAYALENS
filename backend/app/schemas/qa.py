import datetime
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class QuestionRequest(BaseModel):
    question: str

class SourceCitation(BaseModel):
    page_number: int
    section_title: str
    excerpt: str

class QuestionAnswerResponse(BaseModel):
    id: str
    document_id: str
    user_id: str
    question: str
    answer: str
    confidence_score: float = 0.95
    grounded: bool = True
    sources_json: Optional[List[Dict[str, Any]]] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
