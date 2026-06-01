from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from decimal import Decimal
from typing import List


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., description="ID of the product to order")
    quantity: int = Field(..., ge=1, description="Quantity to order (min 1)")


class OrderCreate(BaseModel):
    customer_id: int = Field(..., description="ID of the customer placing the order")
    items: List[OrderItemCreate] = Field(
        ..., min_length=1, description="List of items in the order"
    )


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    product: "ProductBrief"


class ProductBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str


class CustomerBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime
    customer: CustomerBrief
    items: List[OrderItemResponse]


class OrderListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime
    customer: CustomerBrief


# Resolve forward references
OrderItemResponse.model_rebuild()
