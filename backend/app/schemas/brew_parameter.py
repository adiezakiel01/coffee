from pydantic import BaseModel, ConfigDict, Field


class BrewParameterBase(BaseModel):
    key: str = Field(..., min_length=1, max_length=100)
    value: str = Field(..., min_length=1, max_length=255)


class BrewParameterCreate(BrewParameterBase):
    pass


class BrewParameterResponse(BrewParameterBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    brew_id: int
