from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.dashboard import DashboardSummary

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get dashboard summary: totals and low-stock products."""
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = (
        db.query(func.sum(Order.total_amount)).scalar() or Decimal("0.00")
    )

    low_stock_products = (
        db.query(Product)
        .filter(Product.quantity_in_stock <= LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity_in_stock.asc())
        .all()
    )

    return DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=total_revenue,
        low_stock_products=low_stock_products,
    )
