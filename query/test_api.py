import urllib.request
import json

# Try to access the employees endpoint
req = urllib.request.Request('http://localhost:5000/api/v1/employee/store/52')
req.add_header('Accept', 'application/json')

try:
    response = urllib.request.urlopen(req, timeout=5)
    data = json.loads(response.read())
    print("Status:", response.status)
    print("Response (first 2000 chars):", json.dumps(data, indent=2)[:2000])
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    print("Response:", e.read().decode()[:500])
except urllib.error.URLError as e:
    print(f"URL Error: {e.reason}")
    # Try checking if port 5000 is accessible
    print("Backend might not be running or requires authentication")