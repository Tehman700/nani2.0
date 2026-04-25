import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, Float, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    picked_up = "picked_up"
    cancelled = "cancelled"
    no_show = "no_show"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("students.id"), nullable=False)
    parent_id: Mapped[str] = mapped_column(String(36), ForeignKey("parents.id"), nullable=False)
    pickup_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[BookingStatus] = mapped_column(SAEnum(BookingStatus), nullable=False, default=BookingStatus.pending)
    priority_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    student: Mapped["Student"] = relationship("Student")
    parent: Mapped["Parent"] = relationship("Parent")
    queue_entry: Mapped["QueueEntry | None"] = relationship("QueueEntry", back_populates="booking", uselist=False)
