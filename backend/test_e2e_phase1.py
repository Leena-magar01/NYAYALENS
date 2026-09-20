import sys
import os
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_phase1_e2e():
    client = TestClient(app)

    print("--- 1. Testing Health Endpoint ---")
    response = client.get("/api/v1/health")
    assert response.status_code == 200, f"Health check failed: {response.text}"
    print("Health Check Response:", response.json())

    print("\n--- 2. Testing User Registration ---")
    test_user = {
        "email": "test.lawyer@nyayalens.org",
        "password": "SecurePassword123!",
        "full_name": "Adv. Rajesh Kumar"
    }
    reg_response = client.post("/api/v1/auth/register", json=test_user)
    if reg_response.status_code == 400 and "already exists" in reg_response.text:
        print("Test user already exists, proceeding to login.")
    else:
        assert reg_response.status_code == 200, f"Registration failed: {reg_response.text}"
        print("User Registered Successfully. Token generated.")

    print("\n--- 3. Testing User Login ---")
    login_data = {
        "email": test_user["email"],
        "password": test_user["password"]
    }
    login_response = client.post("/api/v1/auth/login", json=login_data)
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    token_payload = login_response.json()
    assert "access_token" in token_payload, "Missing access_token in response"
    token = token_payload["access_token"]
    print("Login Successful. Token:", token[:25] + "...")

    print("\n--- 4. Testing Authenticated /auth/me Endpoint ---")
    headers = {"Authorization": f"Bearer {token}"}
    me_response = client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200, f"Auth me failed: {me_response.text}"
    user_info = me_response.json()
    assert user_info["email"] == test_user["email"], "User email mismatch"
    print("User Profile Retrieved:", user_info)

    print("\n--- 5. Testing Protected /dashboard/stats Endpoint ---")
    stats_response = client.get("/api/v1/dashboard/stats", headers=headers)
    assert stats_response.status_code == 200, f"Dashboard stats failed: {stats_response.text}"
    stats_data = stats_response.json()
    print("Dashboard Stats Retrieved:", json.dumps(stats_data, indent=2))

    print("\n==========================================")
    print("SUCCESS: Phase 1 End-to-End Integration Verified!")
    print("==========================================")

if __name__ == "__main__":
    test_phase1_e2e()
