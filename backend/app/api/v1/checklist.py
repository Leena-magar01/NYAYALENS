import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Document, DocumentChunk, ActionItem
from app.schemas.checklist import ActionItemResponse, ActionItemToggleResponse
from app.services.ai_analyzer import analyze_document_content

router = APIRouter()

def generate_checklist_for_doc(doc: Document, user_id: str, db: Session) -> List[ActionItem]:
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

    db.query(ActionItem).filter(ActionItem.document_id == doc.id, ActionItem.user_id == user_id).delete()
    db.commit()

    db_items = []
    for item in analysis.action_items:
        db_item = ActionItem(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            user_id=user_id,
            task=item.task,
            category=item.category,
            source_type=item.source_type,
            priority=item.priority,
            completed=False
        )
        db.add(db_item)
        db_items.append(db_item)

    db.commit()
    return db_items


@router.get("/documents/{document_id}/checklist", response_model=List[ActionItemResponse])
def get_document_checklist(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    items = db.query(ActionItem).filter(ActionItem.document_id == doc.id, ActionItem.user_id == current_user.id).all()
    if not items:
        items = generate_checklist_for_doc(doc, current_user.id, db)

    return items


@router.post("/documents/{document_id}/checklist/generate", response_model=List[ActionItemResponse])
def regenerate_document_checklist(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    return generate_checklist_for_doc(doc, current_user.id, db)


@router.patch("/checklist/{item_id}/toggle", response_model=ActionItemToggleResponse)
def toggle_checklist_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(ActionItem).filter(ActionItem.id == item_id, ActionItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found.")

    item.completed = not item.completed
    db.commit()

    return ActionItemToggleResponse(
        id=item.id,
        completed=item.completed,
        message=f"Task status updated to {'completed' if item.completed else 'pending'}."
    )
