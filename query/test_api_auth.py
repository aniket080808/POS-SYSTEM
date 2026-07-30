import urllib.request
import json

# First, try to login to get a token
login_data = json.dumps({
    "email": "aniketmeshram445@gmail.com",
    "password": "Aniket123@"
}).encode('utf-8')

req = urllib.request.Request('http://localhost:5000/api/v1/auth/login', data=login_data)
req.add_header('Content-Type', 'application/json')
req.add_header('Accept', 'application/json')

try:
    response = urllib.request.urlopen(req, timeout=5)
    data = json.loads(response.read())
    print("Login response keys:", list(data.keys()))
    
    # Extract token
    token = data.get('token') or data.get('accessToken') or data.get('jwt') or ''
    print("Got token:", token[:50] + "..." if token else "No token found")
    
    if token:
        # Now call employees endpoint
        emp_req = urllib.request.Request('http://localhost:5000/api/v1/employee/store/52')
        emp_req.add_header('Authorization', f'Bearer {token}')
        emp_req.add_header('Accept', 'application/json')
        
        emp_response = urllib.request.urlopen(emp_req, timeout=5)
        employees = json.loads(emp_response.read())
        
        print(f"\nEmployees for store 52 ({len(employees) if isinstance(employees, list) else 'object'}):")
        emp_str = json.dumps(employees, indent=2)
        print(emp_str[:3000])
        
        # Check if roles are strings
        if isinstance(employees, list):
            for emp in employees:
                role = emp.get('role') or emp.get('userRole') or ''
                print(f"  - {emp.get('email', '?')}: role={role} (type={type(role).__name__})")
        elif isinstance(employees, dict):
            items = employees.get('content') or employees.get('data') or employees.get('employees') or [employees]
            for emp in (items if isinstance(items, list) else [items]):
                role = emp.get('role') or emp.get('userRole') or ''
                print(f"  - {emp.get('email', '?')}: role={role} (type={type(role).__name__})")
        
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    print("Response:", e.read().decode()[:1000])
except urllib.error.URLError as e:
    print(f"URL Error: {e.reason}")