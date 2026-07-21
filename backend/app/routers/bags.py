from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.bean import Bean
from app.models.bag import Bag
from app.models.brew import Brew
from app.schemas.bag import BagCreate, BagResponse, BagWithStats

router = APIRouter(tags=["bags"])


@router.post("/bags", response_model=BagResponse, status_code=status.HTTP_201_CREATED)
async def create_bag(bag_data: BagCreate, db: AsyncSession = Depends(get_db)):
    bean = await db.get(Bean, bag_data.bean_id)
    if bean is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bean with id {bag_data.bean_id} not found",
        )
    bag = Bag(**bag_data.model_dump())
    db.add(bag)
    await db.commit()
    await db.refresh(bag)
    return bag


@router.get("/beans/{bean_id}/bags", response_model=list[BagWithStats])
async def list_bags_for_bean(bean_id: int, db: AsyncSession = Depends(get_db)):
    bean = await db.get(Bean, bean_id)
    if bean is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bean not found"
        )

    result = await db.execute(
        select(
            Bag,
            func.count(Brew.id).label("brew_count"),
            func.avg(Brew.rating).label("avg_rating"),
        )
        .outerjoin(Brew, Brew.bag_id == Bag.id)
        .where(Bag.bean_id == bean_id)
        .group_by(Bag.id)
        .order_by(Bag.roast_date.desc().nullslast(), Bag.created_at.desc())
    )

    bags_with_stats = []
    for bag, brew_count, avg_rating in result.all():
        bags_with_stats.append(
            BagWithStats(
                id=bag.id,
                bean_id=bag.bean_id,
                roast_date=bag.roast_date,
                created_at=bag.created_at,
                brew_count=brew_count,
                avg_rating=round(avg_rating, 1) if avg_rating is not None else None,
            )
        )
    return bags_with_stats


@router.delete("/bags/{bag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bag(bag_id: int, db: AsyncSession = Depends(get_db)):
    bag = await db.get(Bag, bag_id)
    if bag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bag not found"
        )
    await db.delete(bag)
    await db.commit()
