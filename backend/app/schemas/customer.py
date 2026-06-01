from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import datetime


class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200, description="Full name")
    email: EmailStr = Field(..., description="Email address (must be unique)")
    phone_number: str = Field(
        ..., min_length=1, max_length=20, description="Phone number"
    )


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone_number: str
    created_at: datetime
    updated_at: datetime
