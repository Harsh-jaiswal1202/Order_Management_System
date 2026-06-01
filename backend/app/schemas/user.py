from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
