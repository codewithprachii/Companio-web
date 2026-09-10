from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Companio"
    app_version: str = "0.1.0"
    debug: bool = True
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/companio"

    @field_validator("debug", mode="before")
    @classmethod
    def _coerce_debug(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return False
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
