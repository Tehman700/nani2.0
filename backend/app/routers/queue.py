from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, QueueEntry, Booking
from app.models.booking import BookingStatus
from app.schemas.queue import QueueEntryResponse, StudentInfo, ParentInfo

router = APIRouter(prefix="/queue", tags=["queue"])


@router.get("/{section_id}", response_model=list[QueueEntryResponse])
def get_queue(
    section_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    entries = (
        db.query(QueueEntry)
        .join(Booking)
        .filter(
            QueueEntry.section_id == section_id,
            Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
        )
        .order_by(Booking.priority_score.asc())
        .all()
    )

    return [
        QueueEntryResponse(
            position=e.position,
            queue_entry_id=e.id,
            booking_id=e.booking_id,
            student=StudentInfo(id=e.booking.student.id, name=e.booking.student.name),
            parent=ParentInfo(id=e.booking.parent.id, phone=e.booking.parent.phone),
            pickup_time=e.booking.pickup_time,
            status=e.booking.status,
            priority_score=e.booking.priority_score,
        )
        for e in entries
    ]
