import os
from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "NyayaLens Backend API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nyayalens_super_secret_jwt_key_production_2026_safe_hash_xyz")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nyayalens.db")

    @property
    def get_database_url(self) -> str:
        url = self.DATABASE_URL.strip()
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        
        # Safely URL-encode password if URL contains @ and credentials
        if url.startswith("postgresql://") and "@" in url:
            try:
                from urllib.parse import quote_plus
                scheme_part, rest = url.split("://", 1)
                user_pass, host_path = rest.rsplit("@", 1)
                if ":" in user_pass:
                    username, password = user_pass.split(":", 1)
                    # Encode special characters in password if not already encoded
                    if "%" not in password:
                        encoded_password = quote_plus(password)
                        return f"{scheme_part}://{username}:{encoded_password}@{host_path}"
            except Exception:
                pass

        return url
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
