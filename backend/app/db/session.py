"""
Database session management using SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import sessionmaker, declarative_base

from ..core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Yield a database session and ensure it is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create local development tables when migrations are not the release path."""
    from . import models  # noqa: F401

    backend_name = make_url(settings.DATABASE_URL).get_backend_name()
    if backend_name == "sqlite" or settings.DEBUG:
        Base.metadata.create_all(bind=engine)
