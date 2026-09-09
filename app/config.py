from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Companio"
    app_version: str = "0.1.0"
    debug: bool = True
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/companio"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
