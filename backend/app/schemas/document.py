import datetime
from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class DocumentChunkResponse(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    text_content: str
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: str
    file_size: int
    status: str
    ocr_applied: bool
    doc_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime
    chunk_count: int = 0

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentResponse):
    chunks: List[DocumentChunkResponse] = []

class ProcessingStatusResponse(BaseModel):
    id: str
    filename: str
    status: str
    ocr_applied: bool
    page_count: Optional[int] = None
    chunk_count: int = 0
    doc_metadata: Optional[Dict[str, Any]] = None
