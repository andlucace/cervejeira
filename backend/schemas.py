from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BeerCreate(BaseModel):
    name: str
    brand: str
    style: Optional[str] = None
    volume_ml: Optional[int] = None
    description: Optional[str] = None


class BeerUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    style: Optional[str] = None
    volume_ml: Optional[int] = None
    description: Optional[str] = None


class BeerOut(BaseModel):
    id: int
    name: str
    brand: str
    style: Optional[str]
    volume_ml: Optional[int]
    description: Optional[str]
    created_at: datetime
    stock: int

    model_config = {"from_attributes": True}


class TransactionCreate(BaseModel):
    beer_id: int
    type: str  # 'entrada' | 'saida'
    quantity: int
    notes: Optional[str] = None


class TransactionOut(BaseModel):
    id: int
    beer_id: int
    type: str
    quantity: int
    notes: Optional[str]
    created_at: datetime
    beer_name: Optional[str] = None
    beer_brand: Optional[str] = None

    model_config = {"from_attributes": True}
