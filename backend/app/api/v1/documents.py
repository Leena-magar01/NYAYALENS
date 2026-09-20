import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.audit_logger import log_audit_event
from app.api.deps import get_current_user
from app.models.models import User, Document, DocumentChunk
from app.schemas.document import DocumentResponse, DocumentDetailResponse, ProcessingStatusResponse
from app.services.document_parser import parse_document
from app.services.chunker import chunk_document_pages

router = APIRouter()

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads"))

os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_document_pipeline(document_id: str, file_path: str, file_type: str, db: Session):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return

    try:
        doc.status = "processing"
        db.commit()

        pages_data, ocr_applied, metadata = parse_document(file_path, file_type)
        chunks_data = chunk_document_pages(pages_data, document_id)

        # Save document chunks
        db_chunks = [
            DocumentChunk(
                id=str(uuid.uuid4()),
                document_id=document_id,
                chunk_index=c["chunk_index"],
                text_content=c["text_content"],
                page_number=c["page_number"],
                section_title=c["section_title"]
            )
            for c in chunks_data
        ]
        db.bulk_save_objects(db_chunks)

        # Update document record
        doc.ocr_applied = ocr_applied
        doc.doc_metadata = {
            **metadata,
            "chunk_count": len(chunks_data),
            "total_chars": sum(len(c["text_content"]) for c in chunks_data)
        }
        doc.status = "analyzed"
        db.commit()

    except Exception as e:
        doc.status = "failed"
        doc.doc_metadata = {"error": str(e)}
        db.commit()


@router.post("/", response_model=DocumentResponse)
@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filename = file.filename
    _, ext = os.path.splitext(filename)
    ext_lower = ext.lower()

    if ext_lower not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. NyayaLens accepts PDF, DOCX, and TXT files only."
        )

    # Check file size
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowable limit of 15 MB."
        )

    # Prepare secure file path
    doc_id = str(uuid.uuid4())
    user_upload_dir = os.path.join(UPLOAD_DIR, current_user.id)
    os.makedirs(user_upload_dir, exist_ok=True)
    
    clean_filename = f"{doc_id}_{filename.replace(' ', '_')}"
    saved_file_path = os.path.join(user_upload_dir, clean_filename)

    with open(saved_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_type = ext_lower.lstrip(".")

    # Create document record
    doc = Document(
        id=doc_id,
        user_id=current_user.id,
        filename=filename,
        file_path=saved_file_path,
        file_type=file_type,
        file_size=file_size,
        status="processing",
        ocr_applied=False,
        doc_metadata={}
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Process ingestion synchronously so chunks & metadata are immediately available
    process_document_pipeline(doc.id, saved_file_path, file_type, db)
    db.refresh(doc)

    chunk_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).count()

    log_audit_event("DOCUMENT_UPLOAD", current_user.id, {"document_id": doc.id, "filename": doc.filename, "file_size": doc.file_size})

    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        status=doc.status,
        ocr_applied=doc.ocr_applied,
        doc_metadata=doc.doc_metadata,
        created_at=doc.created_at,
        chunk_count=chunk_count
    )


@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()
    results = []
    for d in docs:
        chunk_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == d.id).count()
        results.append(
            DocumentResponse(
                id=d.id,
                user_id=d.user_id,
                filename=d.filename,
                file_type=d.file_type,
                file_size=d.file_size,
                status=d.status,
                ocr_applied=d.ocr_applied,
                doc_metadata=d.doc_metadata,
                created_at=d.created_at,
                chunk_count=chunk_count
            )
        )
    return results


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).order_by(DocumentChunk.chunk_index.asc()).all()

    return DocumentDetailResponse(
        id=doc.id,
        user_id=doc.user_id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        status=doc.status,
        ocr_applied=doc.ocr_applied,
        doc_metadata=doc.doc_metadata,
        created_at=doc.created_at,
        chunk_count=len(chunks),
        chunks=chunks
    )


@router.get("/{document_id}/processing-status", response_model=ProcessingStatusResponse)
def get_processing_status(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    chunk_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).count()
    page_count = doc.doc_metadata.get("page_count") if doc.doc_metadata else None

    return ProcessingStatusResponse(
        id=doc.id,
        filename=doc.filename,
        status=doc.status,
        ocr_applied=doc.ocr_applied,
        page_count=page_count,
        chunk_count=chunk_count,
        doc_metadata=doc.doc_metadata
    )


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Remove file from disk
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()

    log_audit_event("DOCUMENT_DELETE", current_user.id, {"document_id": document_id})

    return {"message": "Document deleted successfully", "document_id": document_id}
