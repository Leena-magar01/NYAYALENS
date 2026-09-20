import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_phase3_analysis():
    client = TestClient(app)

    print("--- 1. Authenticating & Uploading Sample Legal Document ---")
    user_data = {
        "email": "analysis.user@nyayalens.org",
        "password": "SecurePassword123!",
        "full_name": "Adv. Sanya Malhotra"
    }
    client.post("/api/v1/auth/register", json=user_data)
    token = client.post("/api/v1/auth/login", json={"email": user_data["email"], "password": user_data["password"]}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    sample_doc_content = (
        "COMMERCIAL LEASE AGREEMENT\n\n"
        "SECTION 1: PARTIES AND PREMISES\n"
        "This Commercial Lease Agreement is executed on February 1, 2026, by and between Apex Commercial Properties Ltd. ('Landlord') "
        "and TechCorp India Private Limited ('Tenant').\n\n"
        "SECTION 2: RENT AND PAYMENT OBLIGATIONS\n"
        "Tenant agrees to pay a monthly base rent of INR 1,50,000 due on the 1st of each month. "
        "A late fee penalty of INR 5,000 per day shall apply after 5 calendar days of delay.\n\n"
        "SECTION 3: TERM AND AUTO-RENEWAL\n"
        "The lease term is 36 months starting March 1, 2026. This lease shall automatically renew for an additional 12-month period "
        "unless Tenant provides written non-renewal notice at least 90 days prior to expiration.\n\n"
        "SECTION 4: EARLY TERMINATION AND PENALTY\n"
        "If Tenant terminates this Agreement early without cause, Tenant shall forfeit the security deposit of INR 4,50,000 "
        "and pay an early termination fee equivalent to 3 months of rent.\n\n"
        "SECTION 5: CONFIDENTIALITY AND NON-DISCLOSURE\n"
        "Both parties agree to hold proprietary financial terms confidential for 5 years post-termination.\n\n"
        "SECTION 6: DISPUTE RESOLUTION AND ARBITRATION\n"
        "Any dispute arising under this Lease shall be settled by sole arbitrator in Mumbai under Indian Arbitration Act.\n"
    )

    upload_res = client.post(
        "/api/v1/documents/upload",
        files={"file": ("commercial_lease.txt", sample_doc_content.encode("utf-8"), "text/plain")},
        headers=headers
    )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    doc_id = upload_res.json()["id"]
    print("Document uploaded successfully. Doc ID:", doc_id)

    print("\n--- 2. Triggering POST /documents/{id}/analyze ---")
    analyze_res = client.post(f"/api/v1/documents/{doc_id}/analyze", headers=headers)
    assert analyze_res.status_code == 200, f"Analysis trigger failed: {analyze_res.text}"
    analysis = analyze_res.json()

    print("Document Classification:", analysis["document_type"])
    print("Identified Parties:", analysis["parties"])
    print("Extracted Clauses Count:", len(analysis["clauses"]))
    print("Extracted Potential Concerns Count:", len(analysis["findings"]))

    assert len(analysis["clauses"]) > 0, "No clauses extracted!"
    assert len(analysis["parties"]) > 0, "No parties identified!"

    print("\n--- 3. Verifying Source Page & Section Citations ---")
    sample_clause = analysis["clauses"][0]
    print("Sample Extracted Clause:")
    print("  - Category:", sample_clause["category"])
    print("  - Page Number:", sample_clause["page_number"])
    print("  - Section Ref:", sample_clause["section_ref"])
    print("  - Simple Explanation:", sample_clause["simple_explanation"])
    print("  - Why It Matters:", sample_clause["why_it_matters"])
    assert sample_clause["page_number"] is not None
    assert sample_clause["section_ref"] is not None

    print("\n--- 4. Testing GET /documents/{id}/clauses with Category Filter ---")
    payment_clauses_res = client.get(f"/api/v1/documents/{doc_id}/clauses?category=Payment", headers=headers)
    assert payment_clauses_res.status_code == 200
    payment_clauses = payment_clauses_res.json()
    print("Filtered Payment Clauses Count:", len(payment_clauses))
    assert len(payment_clauses) > 0

    print("\n--- 5. Testing GET /documents/{id}/findings with Risk Filter ---")
    findings_res = client.get(f"/api/v1/documents/{doc_id}/findings", headers=headers)
    assert findings_res.status_code == 200
    findings = findings_res.json()
    print("Filtered Potential Concerns Count:", len(findings))
    if len(findings) > 0:
        print("  - Sample Concern Title:", findings[0]["title"])
        print("  - Severity:", findings[0]["severity"])
        print("  - Supporting Text:", findings[0]["supporting_text"])

    print("\n==========================================")
    print("SUCCESS: Phase 3 AI Document Analysis E2E Test Passed!")
    print("==========================================")

if __name__ == "__main__":
    test_phase3_analysis()
