from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:password@localhost:5432/basemgmt"
)

# create the SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Shared Base for declarative models
Base = declarative_base()


def get_db():
    """Dependency injection dla bazy danych"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
