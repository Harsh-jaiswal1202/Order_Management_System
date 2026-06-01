from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate


def get_orders(db: Session):
    """Retrieve all orders with customer info."""
    return (
        db.query(Order)
        .options(joinedload(Order.customer))
        .order_by(Order.created_at.desc())
        .all()
    )


def get_order(db: Session, order_id: int):
    """Retrieve a single order with customer and item details."""
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found",
        )
    return order


def create_order(db: Session, order_data: OrderCreate):
    """
    Create a new order within a single transaction:
    1. Validate customer exists
    2. Validate all products exist and have sufficient stock
    3. Create order + items, snapshot prices, calculate totals
    4. Deduct stock from each product
    If any step fails, the entire transaction is rolled back.
    """
    # 1. Validate customer
    customer = (
        db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    )
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {order_data.customer_id} not found",
        )

    # 2. Validate products and check stock
    order_items = []
    total_amount = Decimal("0.00")

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found",
            )

        if product.quantity_in_stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Insufficient stock for product '{product.name}' "
                    f"(available: {product.quantity_in_stock}, requested: {item.quantity})"
                ),
            )

        # Snapshot unit price and calculate subtotal
        unit_price = Decimal(str(product.price))
        subtotal = unit_price * item.quantity

        order_items.append(
            OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=unit_price,
                subtotal=subtotal,
            )
        )

        total_amount += subtotal

        # 4. Deduct stock
        product.quantity_in_stock -= item.quantity

    # 3. Create the order
    order = Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount,
        status="confirmed",
        items=order_items,
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    # Reload with relationships for response
    return get_order(db, order.id)


def delete_order(db: Session, order_id: int):
    """
    Cancel/delete an order and restore stock for all items.
    """
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found",
        )

    # Restore stock for each item
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()
    return {"message": f"Order #{order_id} cancelled and stock restored"}
