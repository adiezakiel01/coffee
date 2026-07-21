from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class BagBase(BaseModel):
    roast_date: date | None = None


class BagCreate(BagBase):
    bean_id: int


class BagResponse(BagBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    bean_id: int
    created_at: datetime


class BagWithStats(BagResponse):
    brew_count: int
    avg_rating: float | None = None
