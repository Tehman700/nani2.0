from datetime import datetime
from pydantic import BaseModel
from app.models.booking import BookingStatus


class CreateBookingRequest(BaseModel):
    student_id: str
    pickup_time: datetime


class CancelBookingRequest(BaseModel):
    booking_id: str


class UpdateStatusRequest(BaseModel):
    status: BookingStatus


class LocationUpdateRequest(BaseModel):
    booking_id: str
    lat: float
    lng: float


class BookingResponse(BaseModel):
    id: str
    student_id: str
    parent_id: str
    pickup_time: datetime
    status: BookingStatus
    priority_score: float
    created_at: datetime

    model_config = {"from_attributes": True}
