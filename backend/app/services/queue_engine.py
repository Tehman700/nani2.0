from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models.booking import Booking, BookingStatus
from app.models.queue_entry import QueueEntry
from app.models.student import Student
from app.core.ws_manager import manager
from app.core.redis_client import redis_client

SAFE_ZONE_BONUS = 300.0   # seconds — pulls booking 5 min earlier in queue
NO_SHOW_PENALTY = 600.0   # seconds — pushes booking 10 min later


def calculate_priority_score(
    pickup_time: datetime,
    within_safe_zone: bool = False,
    apply_penalty: bool = False,
) -> float:
    score = pickup_time.timestamp()
    if within_safe_zone:
        score -= SAFE_ZONE_BONUS
    if apply_penalty:
        score += NO_SHOW_PENALTY
    return score


def _active_entries(db: Session, section_id: str) -> list[QueueEntry]:
    return (
        db.query(QueueEntry)
        .join(Booking)
        .filter(
            QueueEntry.section_id == section_id,
            Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
        )
        .order_by(Booking.priority_score.asc())
        .all()
    )


def insert_into_queue(db: Session, booking: Booking, section_id: str) -> QueueEntry:
    current_count = (
        db.query(QueueEntry)
        .join(Booking)
        .filter(
            QueueEntry.section_id == section_id,
            Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
        )
        .count()
    )
    entry = QueueEntry(
        booking_id=booking.id,
        section_id=section_id,
        position=current_count + 1,
    )
    db.add(entry)
    db.flush()
    return entry


def reorder_queue(db: Session, section_id: str):
    entries = _active_entries(db, section_id)
    for i, entry in enumerate(entries, start=1):
        entry.position = i
    db.flush()


def _build_payload(entries: list[QueueEntry]) -> list[dict]:
    result = []
    for e in entries:
        result.append({
            "position": e.position,
            "queue_entry_id": e.id,
            "booking_id": e.booking_id,
            "student": {"id": e.booking.student.id, "name": e.booking.student.name},
            "parent": {"id": e.booking.parent.id, "phone": e.booking.parent.phone},
            "pickup_time": e.booking.pickup_time.isoformat(),
            "status": e.booking.status.value,
            "priority_score": e.booking.priority_score,
        })
    return result


def _cache_queue(section_id: str, entries: list[QueueEntry]):
    try:
        key = f"queue:section:{section_id}"
        pipe = redis_client.pipeline()
        pipe.delete(key)
        for e in entries:
            pipe.zadd(key, {e.booking_id: e.booking.priority_score})
        pipe.expire(key, 3600)
        pipe.execute()
    except Exception:
        pass  # Redis is optional — app works without it


async def emit_teacher_update(db: Session, teacher_cnic: str):
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end   = datetime.combine(date.today(), datetime.max.time())

    bookings = (
        db.query(Booking)
        .join(Student, Booking.student_id == Student.id)
        .filter(
            Student.teacher_cnic == teacher_cnic,
            Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
            Booking.pickup_time >= today_start,
            Booking.pickup_time <= today_end,
        )
        .order_by(Booking.priority_score.asc())
        .all()
    )

    payload = [
        {
            "position": i,
            "booking_id": b.id,
            "status": b.status.value,
            "pickup_time": b.pickup_time.isoformat() + "Z",
            "student": {
                "id": b.student.id,
                "name": b.student.name,
                "roll_number": b.student.roll_number,
                "photo_url": b.student.photo_url,
            },
        }
        for i, b in enumerate(bookings, start=1)
    ]

    await manager.broadcast(f"teacher:{teacher_cnic}", {
        "type": "teacher_queue_update",
        "queue": payload,
    })


async def emit_queue_update(db: Session, section_id: str) -> list[dict]:
    entries = _active_entries(db, section_id)
    payload = _build_payload(entries)
    _cache_queue(section_id, entries)
    await manager.broadcast(f"queue:{section_id}", {
        "type": "queue_update",
        "section_id": section_id,
        "queue": payload,
    })
    return payload
