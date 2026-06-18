from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.brew import Brew 

class BrewParameter(Base):
    __tablename__ = "brew_parameters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brew_id: Mapped[int] = mapped_column(Integer, ForeignKey("brews.id", ondelete="CASCADE"))
    key: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)

    brew: Mapped["Brew"] = relationship("Brew", back_populates="parameters")