from pydantic import BaseModel


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    session_id: str
    response: str


class DigestResponse(BaseModel):
    digest: str
