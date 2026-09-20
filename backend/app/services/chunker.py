import re
from typing import List, Dict, Any

HEADING_PATTERNS = [
    r'^(?:ARTICLE|SECTION|CLAUSE|PART|CHAPTER)\s+[0-9IVXLCMD]+(?::|\.|\s-|\s).*$',
    r'^\d+\.\d*\s+[A-Z\s]{3,}.*$',
    r'^[A-Z\s]{4,30}$',  # Short all-caps titles like "TERMINATION CLAUSE"
    r'^(?:WHEREAS|NOW THEREFORE|IN WITNESS WHEREOF|GOVERNING LAW|CONFIDENTIALITY|INDEMNIFICATION|LIABILITY|PAYMENT TERMS|RENEWAL|DISPUTE RESOLUTION).*$',
]

def is_heading(line: str) -> bool:
    line_clean = line.strip()
    if not line_clean or len(line_clean) > 80:
        return False
    for pattern in HEADING_PATTERNS:
        if re.match(pattern, line_clean, re.IGNORECASE):
            return True
    return False

def chunk_document_pages(
    pages_data: List[Dict[str, Any]],
    document_id: str,
    target_chunk_size: int = 750,
    overlap: int = 150
) -> List[Dict[str, Any]]:
    """
    Chunks document pages into overlapping text blocks.
    Retains document_id, page_number, section_title, and chunk_index.
    """
    chunks = []
    chunk_index = 0
    current_section = "General Provisions"

    for page in pages_data:
        page_num = page.get("page_number", 1)
        text = page.get("text", "").strip()

        if not text:
            continue

        # Split page text into paragraphs/lines to detect section headings
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        if not paragraphs:
            paragraphs = [p.strip() for p in text.split("\n") if p.strip()]

        current_buffer = ""

        for para in paragraphs:
            # Check if paragraph acts as a section title
            first_line = para.split("\n")[0]
            if is_heading(first_line):
                current_section = first_line.strip(":#. ")

            # Append paragraph to buffer
            if current_buffer:
                current_buffer += "\n\n" + para
            else:
                current_buffer = para

            # If current buffer reaches target chunk size, flush a chunk
            while len(current_buffer) >= target_chunk_size:
                chunk_text = current_buffer[:target_chunk_size]
                
                chunks.append({
                    "document_id": document_id,
                    "chunk_index": chunk_index,
                    "page_number": page_num,
                    "section_title": current_section,
                    "text_content": chunk_text
                })
                chunk_index += 1
                
                # Advance buffer with overlap
                current_buffer = current_buffer[target_chunk_size - overlap:]

        # Flush any remaining buffer for the page
        if current_buffer.strip():
            chunks.append({
                "document_id": document_id,
                "chunk_index": chunk_index,
                "page_number": page_num,
                "section_title": current_section,
                "text_content": current_buffer.strip()
            })
            chunk_index += 1

    return chunks
