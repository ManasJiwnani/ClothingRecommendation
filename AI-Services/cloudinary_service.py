import os
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

def upload_tryon_image(image_bytes: bytes, user_id: str, outfit_hash: str) -> str:
    """Uploads raw try-on image bytes to Cloudinary and returns the secure URL."""
    public_id = f"vto_{user_id}_{outfit_hash[:12]}"
    result = cloudinary.uploader.upload(
        image_bytes,
        folder="virtual_tryons",
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )
    return result["secure_url"]