from sqlalchemy import Column, Integer, String, Numeric, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    quantity_in_stock = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationship to order items
    order_items = relationship("OrderItem", back_populates="product")

    __table_args__ = (
        CheckConstraint("price >= 0", name="check_price_non_negative"),
        CheckConstraint(
            "quantity_in_stock >= 0", name="check_quantity_non_negative"
        ),
    )

    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', sku='{self.sku}')>"
