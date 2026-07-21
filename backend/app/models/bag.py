from datetime import date, datetime
from typing import TYPE_CHECKING
from sqlalchemy import Date, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.bean import Bean
    from app.models.brew import Brew


class Bag(Base):
    __tablename__ = "bags"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bean_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("beans.id", ondelete="CASCADE"), nullable=False
    )
    roast_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    bean: Mapped["Bean"] = relationship("Bean", back_populates="bags")
    brews: Mapped[list["Brew"]] = relationship("Brew", back_populates="bag")
