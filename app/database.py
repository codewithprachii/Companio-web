from urllib.parse import urlparse, parse_qsl, urlencode

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.config import settings


def _build_connect_args(raw_url: str) -> dict:
    """Return connect_args appropriate for the database driver.

    asyncpg does not accept `sslmode` or `channel_binding` query parameters
    (Neon / Supabase URLs include these), so we strip them and enable SSL
    explicitly via connect_args.
    """
    url = make_url(raw_url)
    connect_args = {}

    if url.get_backend_name() == "postgresql":
        connect_args["ssl"] = True

    return connect_args


def _strip_sqlalchemy_driver(url: str) -> str:
    """Remove any existing query params that asyncpg cannot handle."""
    parsed = urlparse(url)
    if not parsed.query:
        return url
    keep = [
        (k, v)
        for k, v in parse_qsl(parsed.query)
        if k.lower() not in ("sslmode", "channel_binding")
    ]
    new_query = urlencode(keep)
    return parsed._replace(query=new_query).geturl()


_raw_url = settings.database_url

# For PostgreSQL we keep the +asyncpg driver in the URL (SQLAlchemy needs it to
# select asyncpg). If the user provided a plain postgresql:// URL, append it.
if _raw_url.startswith("postgresql://") and "+asyncpg" not in _raw_url:
    _raw_url = _raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    _strip_sqlalchemy_driver(_raw_url),
    echo=settings.debug,
    future=True,
    connect_args=_build_connect_args(_raw_url),
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    async with SessionLocal() as session:
        yield session
