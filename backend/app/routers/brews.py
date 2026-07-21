from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.bean import Bean
from app.models.bag import Bag
from app.models.brew import Brew
from app.schemas.brew import BrewCreate, BrewUpdate, BrewResponse

router = APIRouter(prefix="/brews", tags=["brews"])


@router.post("", response_model=BrewResponse, status_code=status.HTTP_201_CREATED)
async def create_brew(brew_data: BrewCreate, db: AsyncSession = Depends(get_db)):
    if brew_data.bean_id is not None:
        bean = await db.get(Bean, brew_data.bean_id)
        if bean is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bean with id {brew_data.bean_id} not found",
            )
    if brew_data.bag_id is not None:
        bag = await db.get(Bag, brew_data.bag_id)
        if bag is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bag with id {brew_data.bag_id} not found",
            )
    brew = Brew(**brew_data.model_dump())
    db.add(brew)
    await db.commit()
    await db.refresh(brew)
    return brew


@router.get("", response_model=list[BrewResponse])
async def list_brews(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Brew).order_by(Brew.brewed_at.desc()))
    return result.scalars().all()


@router.get("/{brew_id}", response_model=BrewResponse)
async def get_brew(brew_id: int, db: AsyncSession = Depends(get_db)):
    brew = await db.get(Brew, brew_id)
    if brew is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brew not found"
        )
    return brew


@router.patch("/{brew_id}", response_model=BrewResponse)
async def update_brew(
    brew_id: int, brew_data: BrewUpdate, db: AsyncSession = Depends(get_db)
):
    brew = await db.get(Brew, brew_id)
    if brew is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brew not found"
        )
    update_fields = brew_data.model_dump(exclude_unset=True)
    if "bean_id" in update_fields and update_fields["bean_id"] is not None:
        bean = await db.get(Bean, update_fields["bean_id"])
        if bean is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bean with id {update_fields['bean_id']}, not found",
            )
    if "bag_id" in update_fields and update_fields["bag_id"] is not None:
        bag = await db.get(Bag, update_fields["bag_id"])
        if bag is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bag with id {update_fields['bag_id']} not found",
            )
    for field, value in update_fields.items():
        setattr(brew, field, value)
    await db.commit()
    await db.refresh(brew)
    return brew


@router.delete("/{brew_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_brew(brew_id: int, db: AsyncSession = Depends(get_db)):
    brew = await db.get(Brew, brew_id)
    if brew is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brew not found"
        )
    await db.delete(brew)
    await db.commit()
