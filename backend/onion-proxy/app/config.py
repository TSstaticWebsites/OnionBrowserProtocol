from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DIRECTORY_PROXY_URL: str = "http://localhost:3001"
    ENTRY_PROXY_URL: str = "http://localhost:3002"

    class Config:
        env_file = ".env"

settings = Settings()
