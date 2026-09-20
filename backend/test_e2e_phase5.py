import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_phase5_features():
    client = TestClient(app)

    print("--- 1. Authenticating User & Uploading Agreement ---")
    user_data = {
        "email": "phase5.user@nyayalens.org",
        "password": "SecurePassword123!",
        "full_name": "Adv. Neha Sharma"
    }
    client.post("/api/v1/auth/register", json=user_data)
    token = client.post("/api/v1/auth/login", json={"email": user_data["email"], "password": user_data["password"]}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    sample_doc_content = (
        "SERVICE AGREEMENT\n\n"
        "SECTION 1: COMMENCEMENT\n"
        "This Agreement commences on April 1, 2026, and expires on March 31, 2027.\n\n"
        "SECTION 2: PAYMENT AND LATE PENALTY\n"
        "Client shall pay INR 50,000 monthly due on the 5th of each month. "
        "A late fee penalty of INR 2,000 per day shall apply after 5 calendar days of delay.\n\n"
        "SECTION 3: AUTOMATIC RENEWAL AND NOTICE\n"
        "This agreement shall automatically renew for successive 1-year terms unless Client provides 60-day written notice.\n\n"
        "SECTION 4: EARLY TERMINATION PENALTY\n"
        "Early termination by Client prior to 12 months forfeits all advance deposits and incurs INR 1,00,000 penalty.\n"
    )

    upload_res = client.post(
        "/api/v1/documents/upload",
        files={"file": ("service_agreement.txt", sample_doc_content.encode("utf-8"), "text/plain")},
        headers=headers
    )
    doc_id = upload_res.json()["id"]
    print("Document uploaded successfully. Doc ID:", doc_id)

    print("\n--- 2. Testing Potential Concern Detector (GET /documents/{id}/findings) ---")
    analysis_res = client.post(f"/api/v1/documents/{doc_id}/analyze", headers=headers)
    assert analysis_res.status_code == 200
    findings_res = client.get(f"/api/v1/documents/{doc_id}/findings", headers=headers)
    assert findings_res.status_code == 200
    findings = findings_res.json()
    print(f"Extracted {len(findings)} Potential Concern Findings:")
    for f in findings:
        print(f"  - Title: {f['title']} | Severity: {f['severity']}")
        assert f["concern_type"] is not None
        assert f["supporting_text"] is not None

    print("\n--- 3. Testing Legal Timeline Extraction & Source Citations (GET /documents/{id}/timeline) ---")
    timeline_res = client.get(f"/api/v1/documents/{doc_id}/timeline", headers=headers)
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    print(f"Extracted {len(timeline)} Chronological Timeline Events:")
    for ev in timeline:
        print(f"  - Date: {ev['event_date']} | Title: {ev['title']} | Source: {ev['source_ref']}")
        assert ev["event_date"] is not None
        assert ev["source_ref"] is not None

    print("\n--- 4. Testing Action Checklist Separation & Toggle Status ---")
    checklist_res = client.get(f"/api/v1/documents/{doc_id}/checklist", headers=headers)
    assert checklist_res.status_code == 200
    items = checklist_res.json()
    print(f"Extracted {len(items)} Action Items:")
    doc_derived = [it for it in items if it["source_type"] == "Document-Derived Action"]
    gen_suggestions = [it for it in items if it["source_type"] == "General Preparation Suggestion"]
    print(f"  - Document-Derived Actions: {len(doc_derived)}")
    print(f"  - General Preparation Suggestions: {len(gen_suggestions)}")
    assert len(doc_derived) > 0, "No document-derived action items found!"
    assert len(gen_suggestions) > 0, "No general preparation suggestions found!"

    # Test toggling item status
    test_item = items[0]
    toggle_res = client.patch(f"/api/v1/checklist/{test_item['id']}/toggle", headers=headers)
    assert toggle_res.status_code == 200
    toggle_data = toggle_res.json()
    print(f"Toggled Item '{test_item['task'][:40]}...' status -> Completed: {toggle_data['completed']}")
    assert toggle_data["completed"] is not False

    print("\n==========================================")
    print("SUCCESS: Phase 5 Features E2E Test Passed!")
    print("==========================================")

if __name__ == "__main__":
    test_phase5_features()
