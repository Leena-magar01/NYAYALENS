from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

def create_db_engine():
    db_url = settings.get_database_url
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    
    try:
        test_engine = create_engine(
            db_url,
            connect_args=connect_args,
            pool_pre_ping=True
        )
        # Test connection on startup
        with test_engine.connect() as conn:
            pass
        return test_engine
    except Exception as e:
        print(f"[DATABASE WARNING] Primary database connection failed: {e}. Falling back to local SQLite database.")
        return create_engine(
            "sqlite:///./nyayalens.db",
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )

engine = create_db_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
