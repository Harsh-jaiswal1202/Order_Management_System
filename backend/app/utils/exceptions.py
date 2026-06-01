from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


async def integrity_error_handler(request: Request, exc: IntegrityError):
    """Handle database integrity errors (unique constraint violations, etc.)."""
    return JSONResponse(
        status_code=409,
        content={
            "detail": "A database integrity error occurred. A record with the same unique field may already exist."
        },
    )
