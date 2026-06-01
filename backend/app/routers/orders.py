from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse
from app.crud import order as order_crud

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order. Validates stock and auto-calculates totals."""
    return order_crud.create_order(db, order_data)


@router.get("/", response_model=List[OrderListResponse])
def get_orders(db: Session = Depends(get_db)):
    """Retrieve all orders."""
    return order_crud.get_orders(db)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve order details by ID, including items."""
    return order_crud.get_order(db, order_id)


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel/delete an order and restore stock."""
    return order_crud.delete_order(db, order_id)
