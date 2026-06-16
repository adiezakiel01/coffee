from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str
    resend_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_model_name: str = "qwen2.5-coder:7b"

settings = Settings()