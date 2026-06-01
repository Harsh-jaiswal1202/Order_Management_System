from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


def get_customers(db: Session, search: str = None):
    """Retrieve all customers, optionally filtered by name or email."""
    query = db.query(Customer)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Customer.full_name.ilike(search_term),
                Customer.email.ilike(search_term),
            )
        )
    return query.order_by(Customer.created_at.desc()).all()


def get_customer(db: Session, customer_id: int):
    """Retrieve a single customer by ID."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {customer_id} not found",
        )
    return customer


def create_customer(db: Session, customer_data: CustomerCreate):
    """Create a new customer. Raises 409 if email already exists."""
    existing = (
        db.query(Customer).filter(Customer.email == customer_data.email).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Customer with email '{customer_data.email}' already exists",
        )

    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int):
    """Delete a customer. Prevents deletion if customer has associated orders."""
    customer = get_customer(db, customer_id)

    if customer.orders:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete customer that has associated orders",
        )

    db.delete(customer)
    db.commit()
    return {"message": f"Customer '{customer.full_name}' deleted successfully"}
