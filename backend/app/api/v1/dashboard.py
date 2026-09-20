from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Document, Finding, QuestionAnswer, TimelineEvent
from app.schemas.dashboard import DashboardStatsResponse, RecentDocumentItem, ImportantFindingItem

router = APIRouter()

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    docs_count = db.query(Document).filter(Document.user_id == current_user.id).count()
    
    # Query findings for user's documents
    user_doc_ids = [d.id for d in db.query(Document.id).filter(Document.user_id == current_user.id).all()]
    findings_count = db.query(Finding).filter(Finding.document_id.in_(user_doc_ids)).count() if user_doc_ids else 0
    deadlines_count = db.query(TimelineEvent).filter(TimelineEvent.document_id.in_(user_doc_ids)).count() if user_doc_ids else 0
    questions_count = db.query(QuestionAnswer).filter(QuestionAnswer.user_id == current_user.id).count()
    
    # Recent documents
    recent_docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .limit(5)
        .all()
    )
    
    recent_doc_items = [
        RecentDocumentItem(
            id=d.id,
            filename=d.filename,
            file_type=d.file_type,
            file_size=d.file_size,
            status=d.status,
            uploaded_at=d.created_at.strftime("%Y-%m-%d %H:%M")
        )
        for d in recent_docs
    ]

    # Important findings
    important_findings = []
    if user_doc_ids:
        findings = (
            db.query(Finding, Document)
            .join(Document, Finding.document_id == Document.id)
            .filter(Document.user_id == current_user.id)
            .order_by(Finding.created_at.desc())
            .limit(5)
            .all()
        )
        for f, doc in findings:
            important_findings.append(
                ImportantFindingItem(
                    id=f.id,
                    doc_id=doc.id,
                    doc_name=doc.filename,
                    title=f.title,
                    severity=f.severity,
                    explanation=f.explanation
                )
            )

    return DashboardStatsResponse(
        documents_analyzed=docs_count,
        total_findings=findings_count,
        upcoming_deadlines=deadlines_count,
        questions_asked=questions_count,
        recent_documents=recent_doc_items,
        important_findings=important_findings
    )
