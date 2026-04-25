from datetime import datetime
from pydantic import BaseModel
from app.models.booking import BookingStatus


class StudentInfo(BaseModel):
    id: str
    name: str


class ParentInfo(BaseModel):
    id: str
    phone: str | None


class QueueEntryResponse(BaseModel):
    position: int
    queue_entry_id: str
    booking_id: str
    student: StudentInfo
    parent: ParentInfo
    pickup_time: datetime
    status: BookingStatus
    priority_score: float
