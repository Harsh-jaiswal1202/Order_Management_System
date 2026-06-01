from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError

from app.config import get_settings
from app.database import engine, Base
from app.routers import products_router, customers_router, orders_router, dashboard_router
from app.routers.auth import router as auth_router
from app.utils.exceptions import integrity_error_handler
from app.api.deps import get_current_user
from fastapi import Depends

# Import all models so they are registered with Base.metadata
from app.models import Product, Customer, Order, OrderItem, User  # noqa: F401

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="A production-ready API for managing products, customers, orders, and inventory.",
    version="1.0.0",
)

# CORS middleware
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(IntegrityError, integrity_error_handler)

# Include routers
app.include_router(auth_router)
app.include_router(products_router, dependencies=[Depends(get_current_user)])
app.include_router(customers_router, dependencies=[Depends(get_current_user)])
app.include_router(orders_router, dependencies=[Depends(get_current_user)])
app.include_router(dashboard_router, dependencies=[Depends(get_current_user)])


@app.on_event("startup")
def on_startup():
    """Create all database tables on application startup."""
    Base.metadata.create_all(bind=engine)


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for Docker and deployment monitoring."""
    return {"status": "healthy", "service": settings.APP_NAME}
