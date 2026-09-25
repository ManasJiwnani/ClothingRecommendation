import os
import certifi
from dotenv import load_dotenv

load_dotenv()

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

print("CA bundle:", certifi.where())
print("Cloud name:", os.getenv("CLOUDINARY_CLOUD_NAME"))

with open("test.png", "rb") as f:
    result = cloudinary.uploader.upload(
        f,
        folder="clot_wardrobe"
    )

print("SUCCESS!")
print(result["secure_url"])