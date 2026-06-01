from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_products(db: Session, search: str = None):
    """Retrieve all products, optionally filtered by name or SKU."""
    query = db.query(Product)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
            )
        )
    return query.order_by(Product.created_at.desc()).all()


def get_product(db: Session, product_id: int):
    """Retrieve a single product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found",
        )
    return product


def create_product(db: Session, product_data: ProductCreate):
    """Create a new product. Raises 409 if SKU already exists."""
    existing = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with SKU '{product_data.sku}' already exists",
        )

    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, product_data: ProductUpdate):
    """Update an existing product. Checks for SKU uniqueness if changed."""
    product = get_product(db, product_id)

    update_data = product_data.model_dump(exclude_unset=True)

    # Check SKU uniqueness if being updated
    if "sku" in update_data:
        existing = (
            db.query(Product)
            .filter(Product.sku == update_data["sku"], Product.id != product_id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{update_data['sku']}' already exists",
            )

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int):
    """Delete a product. Prevents deletion if product has associated orders."""
    product = get_product(db, product_id)

    if product.order_items:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete product that has associated orders",
        )

    db.delete(product)
    db.commit()
    return {"message": f"Product '{product.name}' deleted successfully"}
