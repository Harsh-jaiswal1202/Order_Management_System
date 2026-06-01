from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationship to orders
    orders = relationship("Order", back_populates="customer")

    def __repr__(self):
        return f"<Customer(id={self.id}, name='{self.full_name}', email='{self.email}')>"
