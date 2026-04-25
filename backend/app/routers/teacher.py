from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, datetime
from app.core.database import get_db
from app.core.security import require_role
from app.models import User, Booking, Student
from app.models.booking import BookingStatus

router = APIRouter(prefix="/teacher", tags=["teacher"])


@router.get("/today-queue")
def today_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    if not current_user.cnic:
        return []

    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end   = datetime.combine(date.today(), datetime.max.time())

    bookings = (
        db.query(Booking)
        .join(Student, Booking.student_id == Student.id)
        .filter(
            Student.teacher_cnic == current_user.cnic,
            Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
            Booking.pickup_time >= today_start,
            Booking.pickup_time <= today_end,
        )
        .order_by(Booking.priority_score.asc())
        .all()
    )

    return [
        {
            "position": i,
            "booking_id": b.id,
            "status": b.status.value,
            "pickup_time": b.pickup_time.isoformat(),
            "student": {
                "id": b.student.id,
                "name": b.student.name,
                "roll_number": b.student.roll_number,
                "photo_url": b.student.photo_url,
            },
        }
        for i, b in enumerate(bookings, start=1)
    ]
