from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./app.db"
    BACKEND_STORAGE_DIR: str = "./storage"
    WHISPER_CPP_BIN: str = "main"  # in PATH
    WHISPER_MODEL_PATH: str = "./models/ggml-small.bin"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    MODEL_NAME: str = "llama3.1:8b"
    CHROMA_PERSIST_DIR: str = "./.chroma"

    class Config:
        env_file = ".env"

@lru_cache
def get_settings():
    return Settings()