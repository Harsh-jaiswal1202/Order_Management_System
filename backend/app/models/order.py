from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(
        Integer, ForeignKey("customers.id"), nullable=False, index=True
    )
    total_amount = Column(Numeric(12, 2), nullable=False, default=0)
    status = Column(String(20), nullable=False, default="confirmed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Order(id={self.id}, customer_id={self.customer_id}, total={self.total_amount})>"


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(
        Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id = Column(
        Integer, ForeignKey("products.id"), nullable=False, index=True
    )
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    __table_args__ = (
        CheckConstraint("quantity >= 1", name="check_item_quantity_positive"),
    )

    def __repr__(self):
        return f"<OrderItem(order_id={self.order_id}, product_id={self.product_id}, qty={self.quantity})>"
