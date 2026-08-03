"""
Acceptance test for P0-1: IDOR fix in StoreAnalyticsController.

Tests:
1. STORE_ADMIN for Store A calling with Store A's storeAdminId → 200 (legitimate)
2. STORE_ADMIN for Store A calling with Store B's storeAdminId → 403 (blocked)
3. STORE_MANAGER for Store A calling with Store A's storeAdminId → 200 (legitimate)
4. STORE_MANAGER for Store A calling with Store B's storeAdminId → 403 (blocked)

Run: python query/test_p0_1_idor.py
"""
import requests
import sys
import os

BASE_URL = os.environ.get("API_URL", "http://localhost:5000")

def login(email, password):
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    resp.raise_for_status()
    return resp.json()["token"]

def get_overview(token, store_admin_id):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/api/store/analytics/{store_admin_id}/overview", headers=headers)
    return resp.status_code, resp.text

def main():
    # TODO: Replace with real test user credentials from the database
    # Expected format: (email, password, store_admin_id, role)
    TEST_USERS = [
        # ("store_admin_a@example.com", "password", 1, "STORE_ADMIN"),
        # ("store_manager_a@example.com", "password", 1, "STORE_MANAGER"),
        # ("store_admin_b@example.com", "password", 2, "STORE_ADMIN"),
    ]

    if not TEST_USERS:
        print("SKIP: No test users configured. Populate TEST_USERS in this script with real credentials.")
        return 0

    failures = 0

    for email, password, own_store_admin_id, role in TEST_USERS:
        print(f"\n--- Testing {email} ({role}) ---")
        try:
            token = login(email, password)
        except Exception as e:
            print(f"FAIL: Login failed for {email}: {e}")
            failures += 1
            continue

        # Test 1: legitimate same-store call → 200
        status, body = get_overview(token, own_store_admin_id)
        if status == 200:
            print(f"PASS: Same-store call returned 200")
        else:
            print(f"FAIL: Same-store call returned {status}: {body[:200]}")
            failures += 1

        # Test 2: cross-store call → 403
        other_store_admin_id = 2 if own_store_admin_id == 1 else 1
        status, body = get_overview(token, other_store_admin_id)
        if status == 403:
            print(f"PASS: Cross-store call returned 403")
        else:
            print(f"FAIL: Cross-store call returned {status}: {body[:200]}")
            failures += 1

    if failures > 0:
        print(f"\nRESULT: FAIL ({failures} test(s) failed)")
        return 1
    else:
        print("\nRESULT: PASS (all tests passed)")
        return 0

if __name__ == "__main__":
    sys.exit(main())