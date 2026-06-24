from datetime import datetime
from pydantic import BaseModel


class RatingTrendPoint(BaseModel):
    brew_id: int
    brewed_at: datetime
    rating: int | None
    bean_name: str | None


class CorrelationalResult(BaseModel):
    bean_id: int
    bean_name: str
    brew_count: int
    correlations: dict[str, float | None]
    best_brews: list[dict]
    message: str | None = None
