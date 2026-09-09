import requests

data = {
    "user_id": "test-user",
    "embedding": [0.1] * 768,
    "limit": 5
}

response = requests.post(
    "http://127.0.0.1:8000/search-clothes",
    json=data
)

print("Status:", response.status_code)
print(response.json())