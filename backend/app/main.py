from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "coffee brew tracker"}