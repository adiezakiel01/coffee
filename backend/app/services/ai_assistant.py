from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.bean import Bean
from app.models.brew import Brew
from app.services.analytics import (
    brews_to_dataframe,
    compute_correlation,
    find_best_brews,
    MIN_BREWS_FOR_CORRELATION,
)

from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from app.config import settings

SYSTEM_PROMPT = """ You are a helpful pour-over coffee brewing assistant. \
You have access to the user's real brew history and statistics below. \
Use ONLY this data to answer questions — never invent brew parameters, \
ratings, or correlations that aren't shown here. If the data doesn't \
answer the question, say so honestly rather than guessing.

BREW HISTORY:
{digest}
"""

_chat_sessions: dict[str, list] = {}


def get_llm() -> ChatOllama:
    return ChatOllama(
        base_url=settings.ollama_base_url,
        model=settings.ollama_model_name,
        temperature=0.3,
    )


async def build_brew_history_digest(db: AsyncSession) -> str:
    """Build a compact text summary of all brew history, suitable for feeding into an llm prompt as context"""

    result = await db.execute(select(Bean).options(selectinload(Bean.brews)))
    beans = result.scalars().all()

    if not beans:
        return "No beans or brews have been logged yet."

    sections = []

    for bean in beans:
        rated_brews = [b for b in bean.brews if b.rating is not None]

        if not rated_brews:
            sections.append(f"## {bean.name}\nNo rated brews yet.")
            continue

        df = brews_to_dataframe(rated_brews)
        best = find_best_brews(df, top_n=1)[0]

        lines = [
            f"## {bean.name} ({bean.origin or 'unknown origin'}, {bean.process or 'unknown process'})"
        ]
        lines.append(
            f"Brews logged: {len(bean.brews)}. Best rating: {int(best['rating'])}/10."
        )
        lines.append(
            f"Best brew parameters: water_temp={best.get('water_temp_celsius')}, "
            f"coffee={best.get('coffee_grams')}g, water={best.get('water_grams')}g, "
            f"bloom={best.get('bloom_time_seconds')}s, total_time={best.get('total_time_seconds')}s."
        )

        if len(rated_brews) >= MIN_BREWS_FOR_CORRELATION:
            correlations = compute_correlation(df)
            strong = {
                k: v for k, v in correlations.items() if v is not None and abs(v) >= 0.5
            }
            if strong:
                corr_text = ", ".join(f"{k}: r={v}" for k, v in strong.items())
                lines.append(f"Notable correlatons with rating: {corr_text}.")

        sections.append("\n".join(lines))

    return "\n\n".join(sections)


async def chat_with_assistant(
    session_id: str, user_message: str, db: AsyncSession
) -> str:
    digest = await build_brew_history_digest(db)
    system_message = SystemMessage(content=SYSTEM_PROMPT.format(digest=digest))

    history = _chat_sessions.get(session_id, [])
    history.append(HumanMessage(content=user_message))

    llm = get_llm()

    messages = [system_message] + history

    response = await llm.ainvoke(messages)

    history.append(AIMessage(content=response.content))
    _chat_sessions[session_id] = history

    return response.content
