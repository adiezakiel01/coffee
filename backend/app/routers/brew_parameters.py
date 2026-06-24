from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.brew import Brew
from app.models.brew_parameter import BrewParameter
from app.schemas.brew_parameter import BrewParameterCreate, BrewParameterResponse

router = APIRouter(prefix="/brews/{brew_id}/parameters", tags=["Brew Parameters"])


async def get_brew_or_404(brew_id: int, db: AsyncSession) -> Brew:

    brew = await db.get(Brew, brew_id)
    if brew is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brew not found"
        )
    return brew


@router.post(
    "", response_model=BrewParameterResponse, status_code=status.HTTP_201_CREATED
)
async def create_brew_parameter(
    brew_id: int,
    brew_parameter: BrewParameterCreate,
    db: AsyncSession = Depends(get_db),
):
    await get_brew_or_404(brew_id, db)

    parameter = BrewParameter(brew_id=brew_id, **brew_parameter.model_dump())
    db.add(parameter)
    await db.commit()
    await db.refresh(parameter)
    return parameter


@router.get("", response_model=list[BrewParameterResponse])
async def list_brew_parameters(
    brew_id: int,
    db: AsyncSession = Depends(get_db),
):
    await get_brew_or_404(brew_id, db)

    result = await db.execute(
        select(BrewParameter).where(BrewParameter.brew_id == brew_id)
    )
    parameters = result.scalars().all()
    return parameters


@router.get("/{parameter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_brew_parameter(
    brew_id: int,
    parameter_id: int,
    db: AsyncSession = Depends(get_db),
):
    await get_brew_or_404(brew_id, db)

    parameter = await db.get(BrewParameter, parameter_id)
    if parameter is None or parameter.brew_id != brew_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brew Parameter not found"
        )

    await db.delete(parameter)
    await db.commit()
