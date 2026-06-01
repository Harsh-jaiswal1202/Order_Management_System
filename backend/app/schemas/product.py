from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from decimal import Decimal
from typing import Optional


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Product name")
    sku: str = Field(..., min_length=1, max_length=50, description="Unique SKU/code")
    price: Decimal = Field(..., ge=0, decimal_places=2, description="Product price")
    quantity_in_stock: int = Field(
        ..., ge=0, description="Quantity available in stock"
    )


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    sku: Optional[str] = Field(None, min_length=1, max_length=50)
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    quantity_in_stock: Optional[int] = Field(None, ge=0)


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    price: Decimal
    quantity_in_stock: int
    created_at: datetime
    updated_at: datetime
