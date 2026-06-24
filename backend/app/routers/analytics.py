from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.bean import Bean
from app.models.brew import Brew
from app.schemas.analytics import RatingTrendPoint, CorrelationalResult
from app.services.analytics import (
    brews_to_dataframe,
    compute_correlation,
    find_best_brews,
    MIN_BREWS_FOR_CORRELATION,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/rating-trend", response_model=list[RatingTrendPoint])
async def get_rating_trend(db: AsyncSession = Depends(get_db)):
    """
    Get the trend of ratings over time for all brews.
    """
    result = await db.execute(
        select(Brew).options(selectinload(Brew.bean)).order_by(Brew.brewed_at.asc())
    )
    brews = result.scalars().all()

    trend_points = [
        RatingTrendPoint(
            brew_id=brew.id,
            brewed_at=brew.brewed_at,
            rating=brew.rating,
            bean_name=brew.bean.name if brew.bean else None,
        )
        for brew in brews
    ]

    return trend_points


@router.get("/correlation/{bean_id}", response_model=CorrelationalResult)
async def get_correlation(bean_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get the correlation of brew parameters with ratings for a specific bean.
    """
    bean = await db.get(Bean, bean_id)
    if not bean:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bean not found"
        )

    result = await db.execute(select(Brew).where(Brew.bean_id == bean_id))
    brews = result.scalars().all()

    if len(brews) < MIN_BREWS_FOR_CORRELATION:
        return CorrelationalResult(
            bean_id=bean.id,
            bean_name=bean.name,
            brew_count=len(brews),
            correlations={},
            best_brews=[],
            message=(
                f"Not enough brews for correlation analysis. Minimum required is {MIN_BREWS_FOR_CORRELATION}."
            ),
        )

    df = brews_to_dataframe(brews)
    correlations = compute_correlation(df)
    best_brews = find_best_brews(df)

    return CorrelationalResult(
        bean_id=bean.id,
        bean_name=bean.name,
        brew_count=len(brews),
        correlations=correlations,
        best_brews=best_brews,
    )
