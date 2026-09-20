import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Document, DocumentChunk, TimelineEvent
from app.schemas.timeline import TimelineEventResponse
from app.services.ai_analyzer import analyze_document_content

router = APIRouter()

def generate_timeline_for_doc(doc: Document, db: Session) -> List[TimelineEvent]:
    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).order_by(DocumentChunk.chunk_index.asc()).all()
    if not chunks:
        return []

    chunks_data = [
        {
            "chunk_index": c.chunk_index,
            "page_number": c.page_number or 1,
            "section_title": c.section_title or "General",
            "text_content": c.text_content
        }
        for c in chunks
    ]

    analysis = analyze_document_content(doc.filename, chunks_data)

    db.query(TimelineEvent).filter(TimelineEvent.document_id == doc.id).delete()
    db.commit()

    db_events = []
    for ev in analysis.timeline_events:
        db_ev = TimelineEvent(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            event_date=ev.event_date,
            title=ev.title,
            description=ev.description,
            category=ev.category,
            source_ref=ev.source_ref
        )
        db.add(db_ev)
        db_events.append(db_ev)

    db.commit()
    return db_events


@router.get("/{document_id}/timeline", response_model=List[TimelineEventResponse])
def get_document_timeline(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    events = db.query(TimelineEvent).filter(TimelineEvent.document_id == doc.id).order_by(TimelineEvent.created_at.asc()).all()
    if not events:
        events = generate_timeline_for_doc(doc, db)

    return events


@router.post("/{document_id}/timeline/generate", response_model=List[TimelineEventResponse])
def regenerate_document_timeline(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    return generate_timeline_for_doc(doc, db)
