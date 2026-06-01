from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.crud import customer as customer_crud

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.post(
    "/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED
)
def create_customer(customer_data: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer."""
    return customer_crud.create_customer(db, customer_data)


@router.get("/", response_model=List[CustomerResponse])
def get_customers(search: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve all customers. Optionally filter by name or email with ?search="""
    return customer_crud.get_customers(db, search)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Retrieve customer details by ID."""
    return customer_crud.get_customer(db, customer_id)


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete a customer."""
    return customer_crud.delete_customer(db, customer_id)
