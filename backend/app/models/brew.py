from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.brew_parameter import BrewParameter


class Brew(Base):
    __tablename__ = "brews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bean_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("beans.id", ondelete="SET NULL")
    )
    brewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    grind_size: Mapped[str | None] = mapped_column(String(50))
    water_temp_celsius: Mapped[float | None] = mapped_column(Numeric(4, 1))
    coffee_grams: Mapped[float | None] = mapped_column(Numeric(5, 1))
    water_grams: Mapped[float | None] = mapped_column(Numeric(6, 1))
    bloom_time_seconds: Mapped[int | None] = mapped_column(Integer)
    total_time_seconds: Mapped[int | None] = mapped_column(Integer)
    tasting_notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    rating: Mapped[int | None] = mapped_column(SmallInteger)

    parameters: Mapped[list["BrewParameter"]] = relationship(
        "BrewParameter", back_populates="brew", cascade="all, delete-orphan"
    )
