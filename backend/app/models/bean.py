from datetime import date, datetime
from typing import TYPE_CHECKING
from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.brew import Brew


class Bean(Base):
    __tablename__ = "beans"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    roaster: Mapped[str | None] = mapped_column(String(255))
    origin: Mapped[str | None] = mapped_column(String(255))
    continent: Mapped[str | None] = mapped_column(String(100))
    region: Mapped[str | None] = mapped_column(String(255))
    farm: Mapped[str | None] = mapped_column(String(255))
    variety: Mapped[str | None] = mapped_column(String(255))
    altitude: Mapped[str | None] = mapped_column(Integer)
    process: Mapped[str | None] = mapped_column(String(100))
    tasting_notes: Mapped[str | None] = mapped_column(Text)
    roast_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    brews: Mapped[list["Brew"]] = relationship("Brew", back_populates="bean")
