from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_admin_token, require_role
from app.models import User, Student, Parent, Booking, BookingStatus
from app.models.enums import UserRole
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(tags=["admin"])


# ── Auth ────────────────────────────────────────────────────────────────────

@router.post("/admin-login", response_model=TokenResponse)
def admin_login(body: LoginRequest):
    if body.email != settings.ADMIN_EMAIL or body.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return TokenResponse(
        access_token=create_admin_token(),
        role=UserRole.super_admin,
        user_id="__admin__",
        cnic=None,
    )


# ── Stats ────────────────────────────────────────────────────────────────────

@router.get("/admin/stats")
def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("branch_admin", "super_admin")),
):
    return {
        "total_users":     db.query(User).count(),
        "total_parents":   db.query(User).filter(User.role == UserRole.parent).count(),
        "total_teachers":  db.query(User).filter(User.role == UserRole.teacher).count(),
        "total_students":  db.query(Student).count(),
        "total_bookings":  db.query(Booking).count(),
        "active_bookings": db.query(Booking).filter(
            Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed])
        ).count(),
    }


# ── Teacher → Student tree ───────────────────────────────────────────────────

@router.get("/admin/teacher-tree")
def teacher_tree(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("branch_admin", "super_admin")),
):
    teachers = db.query(User).filter(User.role == UserRole.teacher).all()
    result = []
    for t in teachers:
        students = (
            db.query(Student).filter(Student.teacher_cnic == t.cnic).all()
            if t.cnic else []
        )
        result.append({
            "teacher": {"id": t.id, "name": t.name, "email": t.email, "cnic": t.cnic},
            "students": [
                {
                    "id": s.id, "name": s.name, "roll_number": s.roll_number,
                    "class_name": s.class_name, "section_name": s.section_name,
                    "photo_url": s.photo_url,
                }
                for s in students
            ],
        })
    return result


# ── Users CRUD ───────────────────────────────────────────────────────────────

@router.get("/admin/users")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("branch_admin", "super_admin")),
):
    users = db.query(User).order_by(User.role).all()
    return [
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role.value, "cnic": u.cnic}
        for u in users
    ]


class AdminUserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    cnic: str | None = None
    role: str | None = None


@router.put("/admin/users/{user_id}")
def update_user(
    user_id: str,
    body: AdminUserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("branch_admin", "super_admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    for field in ("name", "email", "cnic"):
        val = getattr(body, field)
        if val is not None:
            setattr(user, field, val)
    if body.role is not None:
        try:
            user.role = UserRole(body.role)
        except ValueError:
            raise HTTPException(400, "Invalid role")
    db.commit()
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role.value, "cnic": user.cnic}


@router.delete("/admin/users/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("branch_admin", "super_admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    db.delete(user)
    db.commit()


# ── Students CRUD ────────────────────────────────────────────────────────────

@router.get("/admin/students")
def list_students(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("branch_admin", "super_admin")),
):
    students = db.query(Student).all()
    return [
        {
            "id": s.id, "name": s.name, "roll_number": s.roll_number,
            "class_name": s.class_name, "section_name": s.section_name,
            "teacher_name": s.teacher_name, "teacher_cnic": s.teacher_cnic,
            "qr_hash": s.qr_hash,
            "parent": {
                "name": s.parent.user.name,
                "email": s.parent.user.email,
            } if s.parent else None,
        }
        for s in students
    ]


@router.delete("/admin/students/{student_id}", status_code=204)
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("branch_admin", "super_admin")),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")
    db.delete(student)
    db.commit()


# ── Bookings CRUD ────────────────────────────────────────────────────────────

@router.get("/admin/bookings")
def list_bookings(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("branch_admin", "super_admin")),
):
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    return [
        {
            "id": b.id,
            "status": b.status.value,
            "pickup_time": b.pickup_time.isoformat() + "Z",
            "created_at": b.created_at.isoformat() + "Z",
            "student": {
                "id": b.student.id,
                "name": b.student.name,
                "roll_number": b.student.roll_number,
            },
            "parent": {
                "name": b.parent.user.name if b.parent else "—",
                "email": b.parent.user.email if b.parent else "—",
            },
        }
        for b in bookings
    ]


class AdminStatusUpdate(BaseModel):
    status: str


@router.patch("/admin/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: str,
    body: AdminStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("branch_admin", "super_admin")),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    try:
        booking.status = BookingStatus(body.status)
    except ValueError:
        raise HTTPException(400, "Invalid status")
    db.commit()
    return {"detail": "updated", "status": booking.status.value}


@router.delete("/admin/bookings/{booking_id}", status_code=204)
def delete_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("branch_admin", "super_admin")),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    db.delete(booking)
    db.commit()
