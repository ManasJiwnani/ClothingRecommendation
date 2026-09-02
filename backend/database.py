from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# SQLite database
DATABASE_URL = "sqlite:///./fashion.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database Models
class WardrobeItem(Base):
    __tablename__ = "wardrobe_items"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    clothing_type = Column(String)
    color = Column(String)
    pattern = Column(String)
    season = Column(String)
    formality = Column(String)      # NEW
    occasion = Column(String)       # NEW
    fit = Column(String)            # NEW
    image_path = Column(String)
    uploaded_date = Column(DateTime, default=datetime.utcnow)

# Create tables on startup
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()