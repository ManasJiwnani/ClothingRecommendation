import requests

data = {
    "user_id": "test-user",
    "image_url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "clothing_type": "top",
    "subcategory": "shirt",
    "color": "white",
    "secondary_color": None,
    "pattern": "solid",
    "sleeve_type": "full",
    "fit": "regular",
    "style": "formal",
    "formality": 5,
    "season": ["summer", "spring"],
    "occasions": ["college", "presentation"],
    "embedding": [0.1] * 768
}

response = requests.post(
    "http://127.0.0.1:8000/clothes",
    json=data
)

print("Status:", response.status_code)
print("Response:", response.json())