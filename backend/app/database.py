from urllib.parse import urlparse, urlunparse, parse_qs, urlencode
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


def to_asyncpg_url(url: str) -> str:
    """Ensure the URL uses the asyncpg driver, regardless of how the
    hosting provider formats its connection string (e.g. Render gives
    plain 'postgresql://', which SQLAlchemy would otherwise try to load
    via the sync psycopg2 driver we don't install)."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url


_LIBPQ_ONLY_PARAMS = ("sslmode", "channel_binding")


def strip_sslmode(url: str) -> tuple[str, dict]:
    """Strip the sslmode query parameter from the URL and return it as a dict"""
    parsed = urlparse(url)
    query = parse_qs(parsed.query)

    sslmode = query.pop("sslmode", None)
    for param in _LIBPQ_ONLY_PARAMS:
        query.pop(param, None)
    connect_args = {"ssl": "require"} if sslmode else {}

    clean_query = urlencode(query, doseq=True)
    clean_url = urlunparse(parsed._replace(query=clean_query))
    return clean_url, connect_args


_clean_url, _connect_args = strip_sslmode(to_asyncpg_url(settings.database_url))

engine = create_async_engine(
    _clean_url, pool_pre_ping=True, echo=False, connect_args=_connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
