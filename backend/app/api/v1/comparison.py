import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Document, Clause, DocumentComparison
from app.schemas.comparison import ComparisonRequest, ComparisonResponse
from app.services.comparison_engine import compare_two_documents
from app.services.ai_analyzer import analyze_document_content
from app.models.models import DocumentChunk

router = APIRouter()

def ensure_document_analyzed(doc: Document, db: Session) -> List[dict]:
    clauses = db.query(Clause).filter(Clause.document_id == doc.id).all()
    if clauses:
        return [
            {
                "id": c.id,
                "category": c.category,
                "original_text": c.original_text,
                "simple_explanation": c.simple_explanation,
                "why_it_matters": c.why_it_matters,
                "user_responsibility": c.user_responsibility,
                "potential_concern": c.potential_concern,
                "page_number": c.page_number or 1,
                "section_ref": c.section_ref or "General"
            }
            for c in clauses
        ]

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

    db_clauses = []
    for cl in analysis.clauses:
        db_c = Clause(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            category=cl.category,
            original_text=cl.original_text,
            simple_explanation=cl.simple_explanation,
            why_it_matters=cl.why_it_matters,
            user_responsibility=cl.user_responsibility,
            potential_concern=cl.potential_concern,
            page_number=cl.page_number,
            section_ref=cl.section_ref
        )
        db.add(db_c)
        db_clauses.append({
            "id": db_c.id,
            "category": cl.category,
            "original_text": cl.original_text,
            "simple_explanation": cl.simple_explanation,
            "why_it_matters": cl.why_it_matters,
            "user_responsibility": cl.user_responsibility,
            "potential_concern": cl.potential_concern,
            "page_number": cl.page_number,
            "section_ref": cl.section_ref
        })

    doc.status = "analyzed"
    doc.doc_metadata = {
        **(doc.doc_metadata or {}),
        "document_type": analysis.document_type,
        "summary": analysis.summary,
        "parties": analysis.parties,
        "important_dates": analysis.important_dates,
        "financial_terms": analysis.financial_terms
    }
    db.commit()
    return db_clauses


@router.post("/compare", response_model=ComparisonResponse)
def compare_documents(
    body: ComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if body.doc_a_id == body.doc_b_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please select two different documents to compare.")

    doc_a = db.query(Document).filter(Document.id == body.doc_a_id, Document.user_id == current_user.id).first()
    doc_b = db.query(Document).filter(Document.id == body.doc_b_id, Document.user_id == current_user.id).first()

    if not doc_a or not doc_b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or both selected documents were not found.")

    clauses_a = ensure_document_analyzed(doc_a, db)
    clauses_b = ensure_document_analyzed(doc_b, db)

    meta_a = doc_a.doc_metadata or {}
    meta_b = doc_b.doc_metadata or {}

    result = compare_two_documents(
        doc_a.filename,
        clauses_a,
        meta_a,
        doc_b.filename,
        clauses_b,
        meta_b
    )

    db_comp = DocumentComparison(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        doc_a_id=doc_a.id,
        doc_b_id=doc_b.id,
        summary_json={"summary": result["summary"], "doc_a_name": doc_a.filename, "doc_b_name": doc_b.filename},
        diff_matrix_json=result
    )
    db.add(db_comp)
    db.commit()

    return ComparisonResponse(
        id=db_comp.id,
        user_id=current_user.id,
        doc_a_id=doc_a.id,
        doc_b_id=doc_b.id,
        doc_a_name=doc_a.filename,
        doc_b_name=doc_b.filename,
        summary=result["summary"],
        side_by_side_matrix=result["side_by_side_matrix"],
        key_differences=result["key_differences"],
        clauses_in_one_doc_only=result["clauses_in_one_doc_only"],
        changed_values=result["changed_values"],
        potential_inconsistencies=result["potential_inconsistencies"],
        review_recommendations=result["review_recommendations"],
        created_at=db_comp.created_at
    )


@router.get("/compare/{comparison_id}", response_model=ComparisonResponse)
def get_comparison(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comp = db.query(DocumentComparison).filter(DocumentComparison.id == comparison_id, DocumentComparison.user_id == current_user.id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison record not found.")

    res_data = comp.diff_matrix_json or {}

    return ComparisonResponse(
        id=comp.id,
        user_id=comp.user_id,
        doc_a_id=comp.doc_a_id,
        doc_b_id=comp.doc_b_id,
        doc_a_name=res_data.get("doc_a_name", "Document A"),
        doc_b_name=res_data.get("doc_b_name", "Document B"),
        summary=res_data.get("summary", "Comparison details"),
        side_by_side_matrix=res_data.get("side_by_side_matrix", []),
        key_differences=res_data.get("key_differences", []),
        clauses_in_one_doc_only=res_data.get("clauses_in_one_doc_only", []),
        changed_values=res_data.get("changed_values", []),
        potential_inconsistencies=res_data.get("potential_inconsistencies", []),
        review_recommendations=res_data.get("review_recommendations", []),
        created_at=comp.created_at
    )
