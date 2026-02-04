from pydantic import BaseModel
from typing import Optional


class ItemBase(BaseModel):
    name: str


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    name: Optional[str] = None


class ItemResponse(ItemBase):
    id: int
