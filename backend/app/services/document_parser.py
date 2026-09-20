import os
import re
from typing import List, Dict, Any, Tuple
import fitz  # PyMuPDF
import docx
from PIL import Image

def parse_pdf(file_path: str) -> Tuple[List[Dict[str, Any]], bool, Dict[str, Any]]:
    """
    Extracts text page-by-page from a PDF file using PyMuPDF.
    If a page has less than 30 characters of text, triggers OCR extraction (if pytesseract/pillow is available).
    Returns (pages_data, ocr_applied, metadata).
    """
    doc = fitz.open(file_path)
    pages_data = []
    ocr_applied = False
    total_pages = len(doc)
    
    metadata = {
        "page_count": total_pages,
        "format": "PDF",
        "title": doc.metadata.get("title") or os.path.basename(file_path),
        "author": doc.metadata.get("author") or "Unknown"
    }

    for page_idx in range(total_pages):
        page = doc[page_idx]
        page_num = page_idx + 1
        text = page.get_text("text").strip()
        page_ocr = False

        # If page text is very sparse (e.g. scanned image PDF page), attempt OCR fallback
        if len(text) < 30:
            try:
                import pytesseract
                pix = page.get_pixmap(dpi=150)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                ocr_text = pytesseract.image_to_string(img).strip()
                if len(ocr_text) > len(text):
                    text = ocr_text
                    page_ocr = True
                    ocr_applied = True
            except Exception as e:
                # Fallback gracefully if tesseract binary is not installed locally
                if not text:
                    text = f"[Scanned Image Content on Page {page_num}]"

        pages_data.append({
            "page_number": page_num,
            "text": text,
            "ocr_applied": page_ocr
        })

    doc.close()
    return pages_data, ocr_applied, metadata


def parse_docx(file_path: str) -> Tuple[List[Dict[str, Any]], bool, Dict[str, Any]]:
    """
    Extracts text from DOCX files preserving headings and estimating page numbers.
    """
    doc = docx.Document(file_path)
    pages_data = []
    current_text = []
    current_char_count = 0
    estimated_page = 1
    
    total_paras = len(doc.paragraphs)

    for idx, para in enumerate(doc.paragraphs):
        p_text = para.text.strip()
        if not p_text:
            continue
        
        current_text.append(p_text)
        current_char_count += len(p_text)

        # Estimate a page break roughly every 2500 characters or explicit section break
        if current_char_count >= 2500 or idx == total_paras - 1:
            pages_data.append({
                "page_number": estimated_page,
                "text": "\n\n".join(current_text),
                "ocr_applied": False
            })
            current_text = []
            current_char_count = 0
            estimated_page += 1

    metadata = {
        "page_count": len(pages_data) or 1,
        "format": "DOCX",
        "paragraph_count": total_paras
    }

    return pages_data, False, metadata


def parse_txt(file_path: str) -> Tuple[List[Dict[str, Any]], bool, Dict[str, Any]]:
    """
    Extracts text from plain TXT files.
    """
    content = ""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="latin-1") as f:
            content = f.read()

    paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
    pages_data = []
    chunk_size = 2500
    current_page = 1

    for i in range(0, len(content), chunk_size):
        page_text = content[i : i + chunk_size].strip()
        if page_text:
            pages_data.append({
                "page_number": current_page,
                "text": page_text,
                "ocr_applied": False
            })
            current_page += 1

    metadata = {
        "page_count": len(pages_data) or 1,
        "format": "TXT",
        "char_count": len(content)
    }

    return pages_data, False, metadata


def parse_document(file_path: str, file_type: str) -> Tuple[List[Dict[str, Any]], bool, Dict[str, Any]]:
    """
    Unified entry point for document parsing based on file extension / type.
    """
    ext = file_type.lower()
    if ext == "pdf" or file_path.endswith(".pdf"):
        return parse_pdf(file_path)
    elif ext in ["docx", "doc"] or file_path.endswith(".docx"):
        return parse_docx(file_path)
    elif ext == "txt" or file_path.endswith(".txt"):
        return parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_type}")
