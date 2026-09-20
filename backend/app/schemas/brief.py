import datetime
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class BriefCreateRequest(BaseModel):
    user_concerns: Optional[str] = None

class BriefUpdateRequest(BaseModel):
    title: Optional[str] = None
    issue_summary: Optional[str] = None
    user_concerns: Optional[List[str]] = None
    questions_for_lawyer: Optional[List[str]] = None
    evidence_to_prepare: Optional[List[str]] = None

class LawyerBriefResponse(BaseModel):
    id: str
    document_id: str
    user_id: str
    title: str
    issue_summary: str
    dates_json: List[Dict[str, Any]] = []
    clauses_json: List[Dict[str, Any]] = []
    concerns_json: List[str] = []
    questions_json: List[str] = []
    evidence_json: List[str] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True
