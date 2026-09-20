import datetime
from pydantic import BaseModel
from typing import Optional

class TimelineEventResponse(BaseModel):
    id: str
    document_id: str
    event_date: str
    title: str
    description: str
    category: str = "General"
    source_ref: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
