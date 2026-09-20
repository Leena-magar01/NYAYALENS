import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_phase6_comparison():
    client = TestClient(app)

    print("--- 1. Authenticating User & Uploading Document A & Document B ---")
    user_data = {
        "email": "comparison.user@nyayalens.org",
        "password": "SecurePassword123!",
        "full_name": "Adv. Sanya Kapoor"
    }
    client.post("/api/v1/auth/register", json=user_data)
    token = client.post("/api/v1/auth/login", json={"email": user_data["email"], "password": user_data["password"]}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    doc_a_content = (
        "LEASE AGREEMENT - DRAFT A\n\n"
        "SECTION 1: PARTIES\n"
        "Agreement between Landlord Alpha Properties and Tenant Beta Corp.\n\n"
        "SECTION 2: RENT AND PAYMENT\n"
        "Monthly rent is INR 35,000 due on 5th of each month.\n\n"
        "SECTION 3: NOTICE PERIOD\n"
        "Either party may terminate with 30-day written notice.\n"
    )

    doc_b_content = (
        "LEASE AGREEMENT - REVISED DRAFT B\n\n"
        "SECTION 1: PARTIES\n"
        "Agreement between Landlord Alpha Properties and Tenant Beta Corp.\n\n"
        "SECTION 2: RENT AND PAYMENT\n"
        "Monthly rent is INR 50,000 due on 1st of each month.\n\n"
        "SECTION 3: NOTICE PERIOD\n"
        "Either party may terminate with 60-day written notice.\n\n"
        "SECTION 4: CONFIDENTIALITY AND NON-DISCLOSURE\n"
        "Both parties agree to hold proprietary financial terms confidential for 3 years.\n"
    )

    up_a = client.post("/api/v1/documents/upload", files={"file": ("draft_a.txt", doc_a_content.encode("utf-8"), "text/plain")}, headers=headers)
    up_b = client.post("/api/v1/documents/upload", files={"file": ("draft_b.txt", doc_b_content.encode("utf-8"), "text/plain")}, headers=headers)
    
    doc_a_id = up_a.json()["id"]
    doc_b_id = up_b.json()["id"]
    print(f"Uploaded Doc A ({doc_a_id}) and Doc B ({doc_b_id}).")

    print("\n--- 2. Triggering POST /documents/compare ---")
    comp_res = client.post("/api/v1/documents/compare", json={"doc_a_id": doc_a_id, "doc_b_id": doc_b_id}, headers=headers)
    assert comp_res.status_code == 200, f"Comparison failed: {comp_res.text}"
    comp = comp_res.json()

    print("Comparison Summary:", comp["summary"])
    print("Side-by-Side Matrix Count:", len(comp["side_by_side_matrix"]))
    print("Key Differences Count:", len(comp["key_differences"]))
    print("Changed Values Count:", len(comp["changed_values"]))
    print("Single Doc Clauses Count:", len(comp["clauses_in_one_doc_only"]))

    assert len(comp["side_by_side_matrix"]) > 0
    assert len(comp["key_differences"]) > 0

    print("\n--- 3. Verifying Neutral Non-Judgmental Language ---")
    full_text = json.dumps(comp).lower()
    assert "better" not in full_text, "Found biased 'better' assertion!"
    assert "worse" not in full_text, "Found biased 'worse' assertion!"
    assert "illegal" not in full_text, "Found biased 'illegal' assertion!"
    print("NEUTRALITY COMPLIANCE VERIFIED: Zero biased 'better/worse' statements found.")

    print("\n--- 4. Verifying Source Citations in Comparison Findings ---")
    sample_diff = comp["key_differences"][0]
    print("Sample Key Difference:")
    print("  - Category:", sample_diff["category"])
    print("  - Difference:", sample_diff["difference"])
    print("  - Source A:", sample_diff["source_a"])
    print("  - Source B:", sample_diff["source_b"])
    assert sample_diff["source_a"] is not None
    assert sample_diff["source_b"] is not None

    print("\n==========================================")
    print("SUCCESS: Phase 6 Document Comparison E2E Test Passed!")
    print("==========================================")

if __name__ == "__main__":
    test_phase6_comparison()
