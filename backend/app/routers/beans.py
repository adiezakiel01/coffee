from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.bean import Bean
from app.schemas.bean import BeanCreate, BeanRead, BeanUpdate

router = APIRouter(prefix="/beans", tags=["beans"])

@router.post("", response_model=BeanRead, status_code=status.HTTP_201_CREATED)
async def create_bean(bean_data: BeanCreate, db: AsyncSession = Depends(get_db)):
    bean = Bean(**bean_data.model_dump())
    db.add(bean)
    await db.commit()
    await db.refresh(bean)
    return bean

@router.get("", response_model=list[BeanRead])
async def list_beans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Bean).order_by(Bean.created_at.desc()))
    return result.scalars().all()

@router.get("/{bean_id}", response_model=BeanRead)
async def get_bean(bean_id: int, db: AsyncSession = Depends(get_db)):
    bean = await db.get(Bean, bean_id)
    if bean is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bean not found")
    return bean

@router.patch("/{bean_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_bean(bean_id: int, bean_data: BeanUpdate, db: AsyncSession = Depends(get_db)):
    bean = await db.get(Bean, bean_id)
    if bean is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bean not found")
    
    update_fields = bean_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(bean, field, value)

    await db.commit()
    await db.refresh(bean)
    return bean

@router.delete("/{bean_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bean(bean_id: int, db: AsyncSession = Depends(get_db)):
    bean = await db.get(Bean, bean_id)
    if bean is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bean not found")
    await db.delete(bean)
    await db.commit()
    