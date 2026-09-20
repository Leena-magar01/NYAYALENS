import datetime
from pydantic import BaseModel
from typing import Optional

class ActionItemResponse(BaseModel):
    id: str
    document_id: Optional[str] = None
    user_id: str
    task: str
    category: str = "Review"
    source_type: str = "Document-Derived Action"  # Document-Derived Action vs General Preparation Suggestion
    priority: str = "Medium"
    completed: bool = False
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ActionItemToggleResponse(BaseModel):
    id: str
    completed: bool
    message: str
