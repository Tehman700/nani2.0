from pydantic import BaseModel
from app.models.enums import UserRole


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole = UserRole.parent
    section_id: str | None = None
    cnic: str | None = None  # required for teachers


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: str
    cnic: str | None = None


class UserMeResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    section_id: str | None
    cnic: str | None

    model_config = {"from_attributes": True}
