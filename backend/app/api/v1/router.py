from fastapi import APIRouter
from app.api.v1 import health, auth, dashboard, documents, analysis, qa, timeline, checklist, comparison, brief

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health Check"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(analysis.router, prefix="/documents", tags=["Analysis"])
api_router.include_router(qa.router, prefix="/documents", tags=["Q&A"])
api_router.include_router(timeline.router, prefix="/documents", tags=["Timeline"])
api_router.include_router(checklist.router, tags=["Action Checklist"])
api_router.include_router(comparison.router, prefix="/documents", tags=["Document Comparison"])
api_router.include_router(brief.router, tags=["Lawyer Brief Generator"])
