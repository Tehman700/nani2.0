from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models import User, Booking, Parent, Student
from app.models.booking import BookingStatus
from app.schemas.booking import CreateBookingRequest, CancelBookingRequest, UpdateStatusRequest, BookingResponse
from app.services import queue_engine

router = APIRouter(prefix="/booking", tags=["booking"])


def _require_parent(db: Session, user: User) -> Parent:
    parent = db.query(Parent).filter(Parent.user_id == user.id).first()
    if not parent:
        raise HTTPException(status_code=403, detail="User has no parent profile")
    return parent


@router.post("/create", response_model=BookingResponse, status_code=201)
async def create_booking(
    body: CreateBookingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("parent")),
):
    parent = _require_parent(db, current_user)

    student = db.query(Student).filter(
        Student.id == body.student_id,
        Student.parent_id == parent.id,
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found or not owned by this parent")

    active = db.query(Booking).filter(
        Booking.student_id == body.student_id,
        Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
    ).first()
    if active:
        raise HTTPException(status_code=409, detail="Active booking already exists for this student")

    priority_score = queue_engine.calculate_priority_score(body.pickup_time)
    booking = Booking(
        student_id=body.student_id,
        parent_id=parent.id,
        pickup_time=body.pickup_time,
        status=BookingStatus.pending,
        priority_score=priority_score,
    )
    db.add(booking)
    db.flush()

    if student.section_id:
        queue_engine.insert_into_queue(db, booking, student.section_id)
        queue_engine.reorder_queue(db, student.section_id)
    db.commit()

    if student.section_id:
        await queue_engine.emit_queue_update(db, student.section_id)
    if student.teacher_cnic:
        await queue_engine.emit_teacher_update(db, student.teacher_cnic)

    db.refresh(booking)
    return booking


@router.post("/cancel")
async def cancel_booking(
    body: CancelBookingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("parent")),
):
    parent = _require_parent(db, current_user)

    booking = db.query(Booking).filter(
        Booking.id == body.booking_id,
        Booking.parent_id == parent.id,
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status not in [BookingStatus.pending, BookingStatus.confirmed]:
        raise HTTPException(status_code=400, detail="Only pending or confirmed bookings can be cancelled")

    section_id   = booking.student.section_id
    teacher_cnic = booking.student.teacher_cnic
    booking.status = BookingStatus.cancelled
    db.flush()

    if section_id:
        queue_engine.reorder_queue(db, section_id)
    db.commit()

    if section_id:
        await queue_engine.emit_queue_update(db, section_id)
    if teacher_cnic:
        await queue_engine.emit_teacher_update(db, teacher_cnic)

    return {"detail": "Booking cancelled"}


@router.patch("/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    body: UpdateStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "branch_admin", "super_admin")),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    section_id = booking.student.section_id
    booking.status = body.status
    db.flush()

    queue_engine.reorder_queue(db, section_id)
    db.commit()

    await queue_engine.emit_queue_update(db, section_id)
    return {"detail": f"Status updated to {body.status.value}"}
