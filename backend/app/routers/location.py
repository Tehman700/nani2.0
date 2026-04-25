from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role
from app.models import User, Booking, Parent
from app.models.booking import BookingStatus
from app.schemas.booking import LocationUpdateRequest
from app.services import queue_engine
from app.services.location import is_within_safe_zone

router = APIRouter(prefix="/location", tags=["location"])


def _require_parent(db: Session, user: User) -> Parent:
    parent = db.query(Parent).filter(Parent.user_id == user.id).first()
    if not parent:
        raise HTTPException(status_code=403, detail="User has no parent profile")
    return parent


@router.post("/update")
async def update_location(
    body: LocationUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("parent")),
):
    parent = _require_parent(db, current_user)

    booking = db.query(Booking).filter(
        Booking.id == body.booking_id,
        Booking.parent_id == parent.id,
        Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Active booking not found")

    branch = booking.student.section.class_.branch
    within_zone = False
    if branch.location_lat and branch.location_lng and branch.safe_zone_radius:
        within_zone = is_within_safe_zone(
            body.lat, body.lng,
            branch.location_lat, branch.location_lng,
            branch.safe_zone_radius,
        )

    section_id = booking.student.section_id
    booking.priority_score = queue_engine.calculate_priority_score(
        booking.pickup_time,
        within_safe_zone=within_zone,
    )
    db.flush()

    queue_engine.reorder_queue(db, section_id)
    db.commit()

    await queue_engine.emit_queue_update(db, section_id)
    return {"detail": "Location updated", "within_safe_zone": within_zone}
