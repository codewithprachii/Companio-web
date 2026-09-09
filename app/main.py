import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings

logger = logging.getLogger("companio.startup")
from app.database import (
    Base,
    engine,
    SessionLocal,
    database_is_configured,
)
from app import models  # noqa: F401 - register models
from app.routers import (
    patients,
    screenings,
    assessments,
    caregivers,
    dashboard,
    reminders,
)
from app import seed

STATIC_DIR = Path(__file__).resolve().parent / "static"


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def _init_db_bounded():
    async def _run():
        await init_db()
        async with SessionLocal() as session:
            await seed.seed(session)
            await seed.seed_frequency_bank(session)

    await asyncio.wait_for(_run(), timeout=25)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not database_is_configured():
        logger.warning(
            "No remote database configured; skipping initialization and seed. "
            "Database-backed endpoints will error until DATABASE_URL is set."
        )
        yield
        return

    try:
        await _init_db_bounded()
    except asyncio.TimeoutError:
        logger.exception("Database initialization timed out.")
    except Exception:
        logger.exception(
            "Database initialization/seed failed. The app will keep serving, "
            "but database-backed endpoints may return errors until the database "
            "is reachable."
        )
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Companio - AI-powered Dementia Care and Early Screening Platform. "
        "A screening and decision-support tool, not a medical diagnosis."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(screenings.router)
app.include_router(assessments.router)
app.include_router(caregivers.router)
app.include_router(dashboard.router)
app.include_router(reminders.router)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=FileResponse)
async def root():
    """Serve the Companio prototype UI at the root."""
    return FileResponse(STATIC_DIR / "index.html")
