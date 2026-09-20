from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "NyayaLens Backend API",
        "version": "1.0.0",
        "safety_mode": "Active Legal Boundary Guardrails Enabled"
    }
