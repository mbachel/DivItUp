from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()  # reads  .env file (not yet set up)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./divitup.db")

engine_kwargs = {"echo": True}
if DATABASE_URL.startswith("sqlite"):
  engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()