import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_phase7_lawyer_brief():
    client = TestClient(app)

    print("--- 1. Authenticating User & Uploading Agreement ---")
    user_data = {
        "email": "brief.user@nyayalens.org",
        "password": "SecurePassword123!",
        "full_name": "Adv. Ananya Roy"
    }
    client.post("/api/v1/auth/register", json=user_data)
    token = client.post("/api/v1/auth/login", json={"email": user_data["email"], "password": user_data["password"]}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    sample_doc_content = (
        "EMPLOYMENT AGREEMENT\n\n"
        "SECTION 1: APPOINTMENT AND SALARY\n"
        "Employee Ananya Roy is appointed as Lead Counsel. Monthly salary is INR 2,00,000.\n\n"
        "SECTION 2: NON-COMPETE AND NOTICE\n"
        "Employee agrees to 90-day written notice period for termination. "
        "Non-compete clause restricts working for competitors for 12 months post-exit.\n"
    )

    upload_res = client.post(
        "/api/v1/documents/upload",
        files={"file": ("employment_agreement.txt", sample_doc_content.encode("utf-8"), "text/plain")},
        headers=headers
    )
    doc_id = upload_res.json()["id"]

    print("\n--- 2. Generating Lawyer Brief (POST /documents/{id}/brief) ---")
    brief_res = client.post(
        f"/api/v1/documents/{doc_id}/brief",
        json={"user_concerns": "Concerned about 90-day notice period and 12-month non-compete enforceability."},
        headers=headers
    )
    assert brief_res.status_code == 200, f"Brief creation failed: {brief_res.text}"
    brief = brief_res.json()
    brief_id = brief["id"]

    print("Lawyer Brief Title:", brief["title"])
    print("Executive Situation Summary:", brief["issue_summary"])
    print("User Concerns Count:", len(brief["concerns_json"]))
    print("Target Questions for Lawyer Count:", len(brief["questions_json"]))
    print("Evidence Items Count:", len(brief["evidence_json"]))

    assert brief["title"] is not None
    assert len(brief["questions_json"]) > 0
    assert len(brief["evidence_json"]) > 0

    print("\n--- 3. Testing Brief Editing (PUT /briefs/{brief_id}) ---")
    update_res = client.put(
        f"/api/v1/briefs/{brief_id}",
        json={
            "title": "Customized Legal Consultation Brief for Adv. Ananya Roy",
            "issue_summary": "Updated executive situation summary for legal counsel meeting."
        },
        headers=headers
    )
    assert update_res.status_code == 200
    updated_brief = update_res.json()
    print("Updated Brief Title:", updated_brief["title"])
    assert updated_brief["title"] == "Customized Legal Consultation Brief for Adv. Ananya Roy"

    print("\n--- 4. Testing PDF / HTML Export (GET /briefs/{brief_id}/export-pdf) ---")
    export_res = client.get(f"/api/v1/briefs/{brief_id}/export-pdf", headers=headers)
    assert export_res.status_code == 200
    assert "text/html" in export_res.headers["content-type"]
    assert "PREPARATION AID DISCLAIMER" in export_res.text
    print("Export PDF/HTML generated successfully. Legal Disclaimer Verified in document body.")

    print("\n==========================================")
    print("SUCCESS: Phase 7 Lawyer Brief E2E Test Passed!")
    print("==========================================")

if __name__ == "__main__":
    test_phase7_lawyer_brief()
