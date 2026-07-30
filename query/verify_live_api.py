import urllib.request
import json

# Login as Aniket (ROLE_ADMIN) to get a JWT
login_data = json.dumps({
    "email": "aniketmeshram445@gmail.com",
    "password": "Admin123@"
}).encode('utf-8')

req = urllib.request.Request('http://localhost:5000/auth/login', data=login_data)
req.add_header('Content-Type', 'application/json')
req.add_header('Accept', 'application/json')

token = None
try:
    response = urllib.request.urlopen(req, timeout=10)
    data = json.loads(response.read())
    token = data.get('token') or data.get('accessToken') or data.get('jwt')
    print("Login status:", response.status)
    print("Token present:", bool(token))
except urllib.error.HTTPError as e:
    print(f"Login HTTP Error {e.code}: {e.reason}")
    print("Response:", e.read().decode()[:500])
    token = None

if not token:
    print("ABORTED: Could not obtain JWT")
    exit(1)

# Now call the employees endpoint
emp_req = urllib.request.Request('http://localhost:5000/api/employees/store/52')
emp_req.add_header('Authorization', f'Bearer {token}')
emp_req.add_header('Accept', 'application/json')

try:
    emp_response = urllib.request.urlopen(emp_req, timeout=10)
    employees = json.loads(emp_response.read())
    print(f"\n/api/employees/store/52 status: {emp_response.status}")
    print(f"Total employees returned: {len(employees) if isinstance(employees, list) else 'N/A'}")
    print("\nFull raw JSON:")
    print(json.dumps(employees, indent=2))

    if isinstance(employees, list):
        print("\nPer-employee role check:")
        for emp in employees:
            role = emp.get('role')
            print(f"  id={emp.get('id')} email={emp.get('email')} role={role} storeId={emp.get('storeId')} branchId={emp.get('branchId')}")

except urllib.error.HTTPError as e:
    print(f"\nEmployees HTTP Error {e.code}: {e.reason}")
    print("Response:", e.read().decode()[:1000])
except urllib.error.URLError as e:
    print(f"\nURL Error: {e.reason}")