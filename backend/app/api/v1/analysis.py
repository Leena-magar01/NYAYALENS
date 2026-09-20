import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Document, DocumentChunk, Clause, Finding
from app.schemas.analysis import DocumentAnalysisResponse, ClauseResponse, FindingResponse
from app.services.ai_analyzer import analyze_document_content

router = APIRouter()

@router.post("/{document_id}/analyze", response_model=DocumentAnalysisResponse)
def trigger_document_analysis(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).order_by(DocumentChunk.chunk_index.asc()).all()
    if not chunks:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document has no extracted chunks to analyze.")

    chunks_data = [
        {
            "chunk_index": c.chunk_index,
            "page_number": c.page_number or 1,
            "section_title": c.section_title or "General",
            "text_content": c.text_content
        }
        for c in chunks
    ]

    # Run AI Analysis Pipeline
    analysis = analyze_document_content(doc.filename, chunks_data)

    # Delete previous clauses and findings if re-analyzing
    db.query(Clause).filter(Clause.document_id == doc.id).delete()
    db.query(Finding).filter(Finding.document_id == doc.id).delete()
    db.commit()

    # Save Clauses
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
        db_clauses.append(db_c)

    # Save Findings
    db_findings = []
    for fn in analysis.findings:
        db_f = Finding(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            concern_type=fn.concern_type,
            severity=fn.severity,
            title=fn.title,
            explanation=fn.explanation,
            supporting_text=fn.supporting_text,
            page_number=fn.page_number
        )
        db.add(db_f)
        db_findings.append(db_f)

    # Update Document metadata & status
    existing_meta = doc.doc_metadata or {}
    doc.doc_metadata = {
        **existing_meta,
        "document_type": analysis.document_type,
        "summary": analysis.summary,
        "parties": analysis.parties,
        "important_dates": analysis.important_dates,
        "financial_terms": analysis.financial_terms,
        "obligations": analysis.obligations,
        "rights": analysis.rights,
        "restrictions": analysis.restrictions,
    }
    doc.status = "analyzed"
    db.commit()
    db.refresh(doc)

    return DocumentAnalysisResponse(
        document_id=doc.id,
        filename=doc.filename,
        document_type=analysis.document_type,
        summary=analysis.summary,
        parties=analysis.parties,
        important_dates=analysis.important_dates,
        financial_terms=analysis.financial_terms,
        obligations=analysis.obligations,
        rights=analysis.rights,
        restrictions=analysis.restrictions,
        clauses=db_clauses,
        findings=db_findings
    )


@router.get("/{document_id}/analysis", response_model=DocumentAnalysisResponse)
def get_document_analysis(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    clauses = db.query(Clause).filter(Clause.document_id == doc.id).all()
    findings = db.query(Finding).filter(Finding.document_id == doc.id).all()

    # If document hasn't been analyzed yet, trigger analysis automatically
    if not clauses and not findings:
        return trigger_document_analysis(document_id, db, current_user)

    meta = doc.doc_metadata or {}

    return DocumentAnalysisResponse(
        document_id=doc.id,
        filename=doc.filename,
        document_type=meta.get("document_type", "Legal Agreement"),
        summary=meta.get("summary", "Document analyzed."),
        parties=meta.get("parties", []),
        important_dates=meta.get("important_dates", []),
        financial_terms=meta.get("financial_terms", []),
        obligations=meta.get("obligations", []),
        rights=meta.get("rights", []),
        restrictions=meta.get("restrictions", []),
        clauses=clauses,
        findings=findings
    )


@router.get("/{document_id}/clauses", response_model=List[ClauseResponse])
def get_document_clauses(
    document_id: str,
    category: Optional[str] = Query(None, description="Filter clauses by category"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    query = db.query(Clause).filter(Clause.document_id == doc.id)
    if category:
        query = query.filter(Clause.category.ilike(category))

    return query.order_by(Clause.page_number.asc()).all()


@router.get("/{document_id}/findings", response_model=List[FindingResponse])
@router.get("/{document_id}/concerns", response_model=List[FindingResponse])
def get_document_findings(
    document_id: str,
    severity: Optional[str] = Query(None, description="Filter findings by severity (High, Medium, Low)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    query = db.query(Finding).filter(Finding.document_id == doc.id)
    if severity:
        query = query.filter(Finding.severity.ilike(severity))

    return query.order_by(Finding.created_at.desc()).all()
