from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from typing import List


class LowStockProduct(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    quantity_in_stock: int


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: Decimal
    low_stock_products: List[LowStockProduct]
