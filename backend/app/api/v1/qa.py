import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Document, DocumentChunk, QuestionAnswer
from app.schemas.qa import QuestionRequest, QuestionAnswerResponse
from app.services.rag_engine import answer_question_rag

router = APIRouter()

@router.post("/{document_id}/ask", response_model=QuestionAnswerResponse)
def ask_document_question(
    document_id: str,
    body: QuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question_str = body.question.strip()
    if not question_str:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question cannot be empty.")

    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).order_by(DocumentChunk.chunk_index.asc()).all()
    if not chunks:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document has no extracted chunks to answer from.")

    chunks_data = [
        {
            "chunk_index": c.chunk_index,
            "page_number": c.page_number or 1,
            "section_title": c.section_title or "General",
            "text_content": c.text_content
        }
        for c in chunks
    ]

    # Fetch past conversation history
    past_qa = (
        db.query(QuestionAnswer)
        .filter(QuestionAnswer.document_id == doc.id, QuestionAnswer.user_id == current_user.id)
        .order_by(QuestionAnswer.created_at.asc())
        .all()
    )
    history = [{"question": q.question, "answer": q.answer} for q in past_qa]

    # Run RAG Pipeline
    result = answer_question_rag(question_str, chunks_data, history)

    # Save QuestionAnswer record
    qa_record = QuestionAnswer(
        id=str(uuid.uuid4()),
        document_id=doc.id,
        user_id=current_user.id,
        question=question_str,
        answer=result["answer"],
        confidence_score=result["confidence_score"],
        grounded=result["grounded"],
        sources_json=result["sources"]
    )
    db.add(qa_record)
    db.commit()
    db.refresh(qa_record)

    return qa_record


@router.get("/{document_id}/questions", response_model=List[QuestionAnswerResponse])
def get_document_questions_history(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    return (
        db.query(QuestionAnswer)
        .filter(QuestionAnswer.document_id == doc.id, QuestionAnswer.user_id == current_user.id)
        .order_by(QuestionAnswer.created_at.asc())
        .all()
    )


@router.delete("/{document_id}/questions")
def clear_document_questions_history(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    db.query(QuestionAnswer).filter(QuestionAnswer.document_id == doc.id, QuestionAnswer.user_id == current_user.id).delete()
    db.commit()

    return {"message": "Q&A conversation history cleared", "document_id": document_id}
