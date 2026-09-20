import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Document, Clause, Finding, TimelineEvent, LawyerBrief
from app.schemas.brief import BriefCreateRequest, BriefUpdateRequest, LawyerBriefResponse
from app.services.brief_generator import generate_lawyer_brief
from app.api.v1.analysis import trigger_document_analysis

router = APIRouter()

@router.post("/documents/{document_id}/brief", response_model=LawyerBriefResponse)
@router.get("/documents/{document_id}/brief", response_model=LawyerBriefResponse)
def create_document_brief(
    document_id: str,
    body: BriefCreateRequest = BriefCreateRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    clauses = db.query(Clause).filter(Clause.document_id == doc.id).all()
    findings = db.query(Finding).filter(Finding.document_id == doc.id).all()
    timeline = db.query(TimelineEvent).filter(TimelineEvent.document_id == doc.id).all()

    if not clauses:
        trigger_document_analysis(document_id, db, current_user)
        clauses = db.query(Clause).filter(Clause.document_id == doc.id).all()
        findings = db.query(Finding).filter(Finding.document_id == doc.id).all()

    clauses_data = [
        {
            "category": c.category,
            "simple_explanation": c.simple_explanation,
            "page_number": c.page_number or 1,
            "section_ref": c.section_ref or "General"
        }
        for c in clauses
    ]
    findings_data = [{"title": f.title, "explanation": f.explanation} for f in findings]
    timeline_data = [
        {"event_date": t.event_date, "title": t.title, "source_ref": t.source_ref}
        for t in timeline
    ]

    result = generate_lawyer_brief(
        doc.filename,
        body.user_concerns or "",
        doc.doc_metadata or {},
        clauses_data,
        findings_data,
        timeline_data
    )

    db_brief = LawyerBrief(
        id=str(uuid.uuid4()),
        document_id=doc.id,
        user_id=current_user.id,
        title=result["title"],
        issue_summary=result["issue_summary"],
        dates_json=result["important_dates"],
        clauses_json=result["important_clauses"],
        concerns_json=result["user_concerns"],
        questions_json=result["questions_for_lawyer"],
        created_at=None
    )
    db.add(db_brief)
    db.commit()

    return LawyerBriefResponse(
        id=db_brief.id,
        document_id=db_brief.document_id,
        user_id=db_brief.user_id,
        title=db_brief.title,
        issue_summary=db_brief.issue_summary,
        dates_json=db_brief.dates_json or [],
        clauses_json=db_brief.clauses_json or [],
        concerns_json=db_brief.concerns_json or [],
        questions_json=db_brief.questions_json or [],
        evidence_json=result["evidence_to_prepare"],
        created_at=db_brief.created_at
    )


@router.get("/briefs/{brief_id}", response_model=LawyerBriefResponse)
def get_brief(
    brief_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brief = db.query(LawyerBrief).filter(LawyerBrief.id == brief_id, LawyerBrief.user_id == current_user.id).first()
    if not brief:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lawyer Brief not found.")

    return LawyerBriefResponse(
        id=brief.id,
        document_id=brief.document_id,
        user_id=brief.user_id,
        title=brief.title,
        issue_summary=brief.issue_summary,
        dates_json=brief.dates_json or [],
        clauses_json=brief.clauses_json or [],
        concerns_json=brief.concerns_json or [],
        questions_json=brief.questions_json or [],
        evidence_json=[
            "Original signed agreement document",
            "Payment receipts & deposit statements",
            "Written correspondence logs"
        ],
        created_at=brief.created_at
    )


@router.put("/briefs/{brief_id}", response_model=LawyerBriefResponse)
def update_brief(
    brief_id: str,
    body: BriefUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brief = db.query(LawyerBrief).filter(LawyerBrief.id == brief_id, LawyerBrief.user_id == current_user.id).first()
    if not brief:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lawyer Brief not found.")

    if body.title is not None:
        brief.title = body.title
    if body.issue_summary is not None:
        brief.issue_summary = body.issue_summary
    if body.user_concerns is not None:
        brief.concerns_json = body.user_concerns
    if body.questions_for_lawyer is not None:
        brief.questions_json = body.questions_for_lawyer

    db.commit()
    db.refresh(brief)

    return LawyerBriefResponse(
        id=brief.id,
        document_id=brief.document_id,
        user_id=brief.user_id,
        title=brief.title,
        issue_summary=brief.issue_summary,
        dates_json=brief.dates_json or [],
        clauses_json=brief.clauses_json or [],
        concerns_json=brief.concerns_json or [],
        questions_json=brief.questions_json or [],
        evidence_json=body.evidence_to_prepare or [
            "Original signed agreement document",
            "Payment receipts & deposit statements"
        ],
        created_at=brief.created_at
    )


@router.get("/briefs/{brief_id}/export-pdf")
def export_brief_pdf(
    brief_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brief = db.query(LawyerBrief).filter(LawyerBrief.id == brief_id, LawyerBrief.user_id == current_user.id).first()
    if not brief:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brief not found.")

    return _generate_brief_html_response(brief)

@router.get("/documents/{document_id}/brief/export")
@router.get("/documents/{document_id}/brief/export-pdf")
def export_brief_by_doc_id(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brief = db.query(LawyerBrief).filter(LawyerBrief.document_id == document_id, LawyerBrief.user_id == current_user.id).first()
    if not brief:
        # Create brief if not present
        create_document_brief(document_id, BriefCreateRequest(), db, current_user)
        brief = db.query(LawyerBrief).filter(LawyerBrief.document_id == document_id, LawyerBrief.user_id == current_user.id).first()

    return _generate_brief_html_response(brief)

def _generate_brief_html_response(brief: LawyerBrief) -> Response:
    dates_html = "".join([f"<li><strong>{d.get('event_date')}:</strong> {d.get('title')} (Source: {d.get('source_ref')})</li>" for d in (brief.dates_json or [])])
    clauses_html = "".join([f"<li><strong>[{c.get('category')}]:</strong> {c.get('summary')} (Source: {c.get('source_ref')})</li>" for c in (brief.clauses_json or [])])
    concerns_html = "".join([f"<li>{c}</li>" for c in (brief.concerns_json or [])])
    questions_html = "".join([f"<li>{q}</li>" for q in (brief.questions_json or [])])

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{brief.title}</title>
        <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }}
            h1 {{ font-size: 22px; color: #1e3a8a; border-b: 2px solid #1e3a8a; padding-bottom: 10px; }}
            h2 {{ font-size: 16px; color: #0f172a; margin-top: 20px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }}
            .disclaimer {{ background: #fffbe6; border: 1px solid #ffe58f; border-radius: 6px; padding: 12px; font-size: 12px; color: #873800; margin-bottom: 20px; }}
            ul {{ padding-left: 20px; font-size: 13px; }}
            li {{ margin-bottom: 6px; }}
            .footer {{ margin-top: 40px; border-t: 1px solid #cbd5e1; pt: 10px; font-size: 10px; color: #64748b; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="disclaimer">
            <strong>IMPORTANT PREPARATION AID DISCLAIMER:</strong> This Consultation Brief is an automated preparation document to assist you in organizing information prior to consulting certified legal counsel. This document does NOT constitute legal advice or formal representation.
        </div>

        <h1>{brief.title}</h1>
        <p><strong>Date Generated:</strong> {brief.created_at}</p>

        <h2>1. Executive Situation Summary</h2>
        <p style="font-size: 13px;">{brief.issue_summary}</p>

        <h2>2. Important Dates & Notice Deadlines</h2>
        <ul>{dates_html}</ul>

        <h2>3. Important Clauses Breakdown</h2>
        <ul>{clauses_html}</ul>

        <h2>4. User's Stated Concerns</h2>
        <ul>{concerns_html}</ul>

        <h2>5. Questions to Ask a Qualified Legal Professional</h2>
        <ul>{questions_html}</ul>

        <div class="footer">
            Generated by NyayaLens – AI Legal Information & Document Assistance Platform
        </div>
    </body>
    </html>
    """

    return Response(content=html_content, media_type="text/html", headers={"Content-Disposition": f"attachment; filename=Lawyer_Brief_{brief.id[:8]}.html"})
