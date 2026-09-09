import asyncio
import logging

from app import models  # noqa: F401 - register models
from app.database import Base, engine
from app.main import app

__all__ = ["app"]

logger = logging.getLogger("vercel.db")


async def _ensure_schema():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def _prepare_database():
    """Best-effort schema creation at cold start.

    Vercel may not run FastAPI's lifespan event, so create tables here. If the
    database is unavailable this must never crash the function --- the app will
    simply serve the UI and DB endpoints will return their own errors.
    """
    try:
        asyncio.run(_ensure_schema())
    except RuntimeError:
        # An event loop is already running; schema is handled by the lifespan.
        return
    except Exception:
        logger.exception("Could not initialize the database at cold start.")


_prepare_database()