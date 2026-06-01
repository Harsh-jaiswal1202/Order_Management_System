from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.crud import product as product_crud

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product."""
    return product_crud.create_product(db, product_data)


@router.get("/", response_model=List[ProductResponse])
def get_products(search: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve all products. Optionally filter by name or SKU with ?search="""
    return product_crud.get_products(db, search)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific product by ID."""
    return product_crud.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int, product_data: ProductUpdate, db: Session = Depends(get_db)
):
    """Update product details."""
    return product_crud.update_product(db, product_id, product_data)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product."""
    return product_crud.delete_product(db, product_id)
