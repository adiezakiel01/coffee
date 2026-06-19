from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

class BeanBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    roaster: str | None = Field(None, max_length=255)
    origin: str | None = Field(None, max_length=255)
    process: str | None = Field(None, max_length=255)
    notes: str | None = None
    roast_date: date | None = None

class BeanCreate(BeanBase):
    pass

class BeanUpdate(BeanBase):
    name: str | None = Field(None, min_length=1, max_length=255)
    roaster: str | None = Field(None, max_length=255)
    origin: str | None = Field(None, max_length=255)
    process: str | None = Field(None, max_length=255)
    notes: str | None = None
    roast_date: date | None = None

class BeanResponse(BeanBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime