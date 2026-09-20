import sys
import os
import json
import io

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def create_sample_files():
    sample_dir = os.path.join(os.path.dirname(__file__), "samples")
    os.makedirs(sample_dir, exist_ok=True)

    # 1. Sample TXT Agreement
    txt_path = os.path.join(sample_dir, "rental_agreement.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(
            "RESIDENTIAL LEASE AGREEMENT\n\n"
            "ARTICLE 1: PARTIES\n"
            "This Agreement is entered into on January 15, 2026, by and between Landlord Ramesh Sharma and Tenant Priya Patel.\n\n"
            "ARTICLE 2: RENT AND PAYMENT TERMS\n"
            "The Tenant agrees to pay a monthly rent of INR 35,000 due on or before the 5th day of each month. "
            "Late payment fee of INR 1,500 shall apply after 7 calendar days.\n\n"
            "ARTICLE 3: TERMINATION AND NOTICE\n"
            "Either party may terminate this lease by providing a 60-day written notice. "
            "Early termination by Tenant without notice shall forfeit the security deposit of INR 70,000.\n\n"
            "ARTICLE 4: DISPUTE RESOLUTION\n"
            "Any disputes arising under this agreement shall be submitted to binding arbitration in Mumbai, India.\n"
        )

    # 2. Sample PDF Agreement using PyMuPDF fitz
    import fitz
    pdf_path = os.path.join(sample_dir, "employment_agreement.pdf")
    doc = fitz.open()
    page1 = doc.new_page()
    page1.insert_text((50, 50), "EMPLOYMENT AGREEMENT\n\nSECTION 1: APPOINTMENT\nThis Agreement appoints Priya Patel as Senior Software Engineer.\n\nSECTION 2: CONFIDENTIALITY\nEmployee shall maintain non-disclosure of proprietary trade secrets for 3 years post-termination.")
    page2 = doc.new_page()
    page2.insert_text((50, 50), "SECTION 3: COMPENSATION\nAnnual Base Salary: INR 24,00,000 payable monthly.\n\nSECTION 4: GOVERNING LAW\nGoverned by laws of Maharashtra, India.")
    doc.save(pdf_path)
    doc.close()

    return txt_path, pdf_path

def test_phase2_ingestion():
    client = TestClient(app)

    print("--- 1. Authenticating Test User ---")
    user_data = {
        "email": "ingestion.user@nyayalens.org",
        "password": "SecurePassword123!",
        "full_name": "Adv. Sanya Kapoor"
    }
    client.post("/api/v1/auth/register", json=user_data)
    login_res = client.post("/api/v1/auth/login", json={"email": user_data["email"], "password": user_data["password"]})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("User authenticated successfully.")

    txt_path, pdf_path = create_sample_files()

    print("\n--- 2. Testing TXT Document Ingestion ---")
    with open(txt_path, "rb") as f:
        upload_res = client.post("/api/v1/documents/upload", files={"file": ("rental_agreement.txt", f, "text/plain")}, headers=headers)
    assert upload_res.status_code == 200, f"TXT upload failed: {upload_res.text}"
    txt_doc = upload_res.json()
    print("TXT Upload Successful:", txt_doc["filename"], "| Status:", txt_doc["status"], "| Chunks:", txt_doc["chunk_count"])
    assert txt_doc["status"] == "analyzed"
    assert txt_doc["chunk_count"] > 0

    print("\n--- 3. Testing PDF Document Ingestion with Page & Section Tracking ---")
    with open(pdf_path, "rb") as f:
        upload_pdf_res = client.post("/api/v1/documents/upload", files={"file": ("employment_agreement.pdf", f, "application/pdf")}, headers=headers)
    assert upload_pdf_res.status_code == 200, f"PDF upload failed: {upload_pdf_res.text}"
    pdf_doc = upload_pdf_res.json()
    print("PDF Upload Successful:", pdf_doc["filename"], "| Status:", pdf_doc["status"], "| Chunks:", pdf_doc["chunk_count"])

    pdf_id = pdf_doc["id"]

    print("\n--- 4. Testing GET /documents/{id} & Chunks Retrieval ---")
    detail_res = client.get(f"/api/v1/documents/{pdf_id}", headers=headers)
    assert detail_res.status_code == 200, f"Get detail failed: {detail_res.text}"
    detail_data = detail_res.json()
    assert len(detail_data["chunks"]) > 0
    first_chunk = detail_data["chunks"][0]
    print(f"Retrieved {len(detail_data['chunks'])} chunks for PDF. Sample Chunk #1:")
    print(f"  - Page Number: {first_chunk['page_number']}")
    print(f"  - Section Title: {first_chunk['section_title']}")
    print(f"  - Content Snippet: {first_chunk['text_content'][:80]}...")

    print("\n--- 5. Testing GET /documents/{id}/processing-status ---")
    status_res = client.get(f"/api/v1/documents/{pdf_id}/processing-status", headers=headers)
    assert status_res.status_code == 200
    status_data = status_res.json()
    print("Processing Status Response:", status_data)
    assert status_data["status"] == "analyzed"

    print("\n--- 6. Testing Document File Size & Extension Validation ---")
    invalid_res = client.post("/api/v1/documents/upload", files={"file": ("malicious.exe", b"exe data", "application/octet-stream")}, headers=headers)
    assert invalid_res.status_code == 400
    print("Invalid extension rejected with HTTP 400 as expected:", invalid_res.json()["detail"])

    print("\n--- 7. Testing DELETE /documents/{id} ---")
    del_res = client.delete(f"/api/v1/documents/{pdf_id}", headers=headers)
    assert del_res.status_code == 200
    print("PDF Document Deleted Successfully.")

    # Confirm deletion
    get_del_res = client.get(f"/api/v1/documents/{pdf_id}", headers=headers)
    assert get_del_res.status_code == 404
    print("Confirmed 404 after deletion.")

    print("\n==========================================")
    print("SUCCESS: Phase 2 Document Ingestion E2E Test Passed!")
    print("==========================================")

if __name__ == "__main__":
    test_phase2_ingestion()
