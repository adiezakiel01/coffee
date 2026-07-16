from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse, DigestResponse
from app.services.ai_assistant import chat_with_assistant, build_brew_history_digest

from app.limiter import limiter

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    response_text = await chat_with_assistant(request.session_id, request.message, db)
    return ChatResponse(session_id=request.session_id, response=response_text)


@router.get("/digest", response_model=DigestResponse)
@limiter.limit("10/minute")
async def get_digest(request: Request, db: AsyncSession = Depends(get_db)):
    digest_text = await build_brew_history_digest(db)
    return DigestResponse(digest=digest_text)
