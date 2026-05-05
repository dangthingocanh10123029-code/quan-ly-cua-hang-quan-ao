from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Server
    PORT: int = 8000
    DEBUG: bool = True
    
    # Database
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "clothing_store"
    
    # JWT
    JWT_SECRET: str = "your_secret_key_here_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 30
    
    # Upload
    MAX_FILE_SIZE: int = 5242880  # 5MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
