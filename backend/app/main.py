from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.database import engine
from app.limiter import limiter
from app.routers import beans, brews, brew_parameters, analytics, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin():
        print("Database connection established")
    yield
    await engine.dispose()
    print("Database connection closed")


app = FastAPI(
    title="Coffee brew tracker",
    description="Track and analyse your pour-over coffee brewing sessions",
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://coffee-navy-pi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(beans.router)
app.include_router(brews.router)
app.include_router(brew_parameters.router)
app.include_router(analytics.router)
app.include_router(chat.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "coffee brew tracker"}
