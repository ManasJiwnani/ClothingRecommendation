from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import os
from datetime import datetime
from PIL import Image
import io

# Import our database setup
from database import get_db, WardrobeItem, engine, Base
from transformers import CLIPProcessor, CLIPModel

# Create tables
Base.metadata.create_all(bind=engine)

# Setup file storage
UPLOAD_DIR = Path("uploaded_images")
UPLOAD_DIR.mkdir(exist_ok=True)

# Load Fashion-CLIP model
print("Loading Fashion-CLIP model...")
model = CLIPModel.from_pretrained("patrickjohncyh/fashion-clip")
processor = CLIPProcessor.from_pretrained("patrickjohncyh/fashion-clip")
print("Model loaded!")

app = FastAPI()

# Predefined attributes for analysis
CLOTHING_TYPES = ["shirt", "pants", "dress", "jacket", "coat", "shoes", "skirt", "sweater", "t-shirt", "jeans"]
COLORS = ["red", "blue", "green", "black", "white", "yellow", "pink", "purple", "orange", "brown", "gray"]
PATTERNS = ["solid", "striped", "floral", "checkered", "polka-dot", "abstract"]
SEASONS = ["summer", "winter", "spring", "fall", "all-season"]
FORMALITY = ["casual", "business-casual", "formal", "party"]
OCCASION = ["work", "gym", "casual", "date", "formal-event", "party"]
FIT = ["fitted", "regular", "loose", "oversized"]

def analyze_image_with_clip(image_path: str) -> dict:
    """Analyze image using Fashion-CLIP to extract metadata (optimized)"""
    image = Image.open(image_path).convert("RGB")
    
    # Improved prompts with more descriptive language for better accuracy
    type_prompts = [
        "a short-sleeved shirt or top for casual wear",
        "a full-length or cropped pants",
        "a dress or skirt-like garment",
        "an outer layer like a blazer or jacket",
        "a heavy overcoat or parka",
        "footwear or shoes",
        "a knee-length or longer skirt",
        "a pullover knit sweater or cardigan",
        "a casual t-shirt or graphic tee",
        "denim jeans or denim pants"
    ]
    
    color_prompts = [
        "bright red colored fabric",
        "blue colored fabric",
        "green colored fabric",
        "black or dark colored fabric",
        "white or very light colored fabric",
        "bright yellow colored fabric",
        "pink or light red colored fabric",
        "purple or violet colored fabric",
        "orange colored fabric",
        "brown or tan colored fabric",
        "gray or neutral colored fabric"
    ]
    
    pattern_prompts = [
        "plain single color with no pattern",
        "horizontal or vertical stripes",
        "floral print or flower patterns",
        "checkered or grid pattern",
        "polka dots or circular spots",
        "abstract design or irregular pattern"
    ]
    
    season_prompts = [
        "light thin breathable material for hot summer weather",
        "thick heavy insulated material for cold winter weather",
        "medium weight layering piece for spring weather",
        "medium weight layering piece for fall/autumn weather",
        "versatile year-round basic suitable for any season"
    ]
    
    formality_prompts = [
        "casual everyday relaxed clothing",
        "smart casual business casual professional clothing",
        "formal elegant dressier clothing",
        "party festive special occasion clothing"
    ]
    
    occasion_prompts = [
        "professional work office business environment",
        "gym workout sports athletic activity",
        "casual everyday informal setting",
        "romantic date night special occasion",
        "formal event gala ceremony dress code",
        "social party gathering celebration"
    ]
    
    fit_prompts = [
        "tight fitted body-hugging silhouette",
        "comfortable regular standard fit",
        "relaxed loose comfortable fit",
        "very oversized baggy loose fit"
    ]
    
    # Helper function to get best match
    def get_best_match(prompts, labels):
        inputs = processor(text=prompts, images=image, return_tensors="pt", padding=True)
        outputs = model(**inputs)
        best_idx = outputs.logits_per_image[0].argmax().item()
        return labels[best_idx]
    
    # Analyze all attributes
    clothing_type = get_best_match(type_prompts, CLOTHING_TYPES)
    color = get_best_match(color_prompts, COLORS)
    pattern = get_best_match(pattern_prompts, PATTERNS)
    season = get_best_match(season_prompts, SEASONS)
    formality = get_best_match(formality_prompts, FORMALITY)
    occasion = get_best_match(occasion_prompts, OCCASION)
    fit = get_best_match(fit_prompts, FIT)
    
    return {
        "clothing_type": clothing_type,
        "color": color,
        "pattern": pattern,
        "season": season,
        "formality": formality,
        "occasion": occasion,
        "fit": fit
    }
@app.get("/")
def home():
    return {
        "message": "Fashion Recommendation API is running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload image and analyze with Fashion-CLIP"""
    try:
        # Save file
        contents = await file.read()
        filename = file.filename
        file_path = UPLOAD_DIR / filename
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Analyze image
        print(f"Analyzing {filename}...")
        metadata = analyze_image_with_clip(str(file_path))
        
        # Save to database
        db_item = WardrobeItem(
            filename=filename,
            clothing_type=metadata["clothing_type"],
            color=metadata["color"],
            pattern=metadata["pattern"],
            season=metadata["season"],
            formality=metadata["formality"],
            occasion=metadata["occasion"],
            fit=metadata["fit"],
            image_path=str(file_path),
            uploaded_date=datetime.utcnow()
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        return {
            "id": db_item.id,
            "filename": filename,
            "content_type": file.content_type,
            "size": len(contents),
            "metadata": {
                "clothing_type": metadata["clothing_type"],
                "color": metadata["color"],
                "pattern": metadata["pattern"],
                "season": metadata["season"],
                "formality": metadata["formality"],      # NEW
                "occasion": metadata["occasion"],        # NEW
                "fit": metadata["fit"]                   # NEW
            },
            "uploaded_date": db_item.uploaded_date
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/wardrobe")
async def get_wardrobe(db: Session = Depends(get_db)):
    """Get all wardrobe items"""
    items = db.query(WardrobeItem).all()
    return items

@app.get("/wardrobe/{item_id}")
async def get_wardrobe_item(item_id: int, db: Session = Depends(get_db)):
    """Get specific wardrobe item"""
    item = db.query(WardrobeItem).filter(WardrobeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.delete("/wardrobe/{item_id}")
async def delete_wardrobe_item(item_id: int, db: Session = Depends(get_db)):
    """Delete wardrobe item"""
    item = db.query(WardrobeItem).filter(WardrobeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    
    return {"message": "Item deleted successfully"}