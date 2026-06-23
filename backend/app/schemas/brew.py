from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class BrewBase(BaseModel):
    bean_id: int | None = None
    grind_size: str | None = Field(None, max_length=50)
    water_temp_celsius: Decimal | None = Field(None, max_digits=4, decimal_places=1)
    coffee_grams: Decimal | None = Field(None, max_digits=5, decimal_places=1)
    water_grams: Decimal | None = Field(None, max_digits=6, decimal_places=1)
    bloom_time_seconds: int | None = None
    total_time_seconds: int | None = None
    rating: int | None = Field(None, ge=1, le=10)
    tasting_notes: str | None = None


class BrewCreate(BrewBase):
    pass


class BrewUpdate(BaseModel):
    bean_id: int | None = None
    grind_size: str | None = Field(None, max_length=50)
    water_temp_celsius: Decimal | None = Field(None, max_digits=4, decimal_places=1)
    coffee_grams: Decimal | None = Field(None, max_digits=5, decimal_places=1)
    water_grams: Decimal | None = Field(None, max_digits=6, decimal_places=1)
    bloom_time_seconds: int | None = None
    total_time_seconds: int | None = None
    rating: int | None = Field(None, ge=1, le=10)
    tasting_notes: str | None = None


class BrewResponse(BrewBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    brewed_at: datetime
    created_at: datetime
