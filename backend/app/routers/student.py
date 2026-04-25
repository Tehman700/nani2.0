from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.models import User, Student, Parent
from app.schemas.student import AddStudentRequest, UpdateStudentRequest, StudentResponse, TeacherStudentView

router = APIRouter(prefix="/student", tags=["student"])


def _require_parent(db: Session, user: User) -> Parent:
    parent = db.query(Parent).filter(Parent.user_id == user.id).first()
    if not parent:
        raise HTTPException(status_code=403, detail="User has no parent profile")
    return parent


@router.post("/add", response_model=StudentResponse, status_code=201)
def add_student(
    body: AddStudentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("parent")),
):
    parent = _require_parent(db, current_user)

    student = Student(
        name=body.name,
        roll_number=body.roll_number,
        photo_url=body.photo_url,
        class_name=body.class_name,
        section_name=body.section_name,
        teacher_name=body.teacher_name,
        teacher_cnic=body.teacher_cnic,
        section_id=body.section_id,
        parent_id=parent.id,
    )
    student.qr_hash = Student.generate_qr_hash(student.id or "tmp")
    db.add(student)
    db.flush()
    # Regenerate with real id now that it's flushed
    student.qr_hash = Student.generate_qr_hash(student.id)
    db.commit()
    db.refresh(student)
    return student


@router.get("/my-kids", response_model=list[StudentResponse])
def my_kids(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("parent")),
):
    parent = _require_parent(db, current_user)
    students = db.query(Student).filter(Student.parent_id == parent.id).all()
    return students


@router.get("/teacher-view", response_model=list[TeacherStudentView])
def teacher_view(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    if not current_user.cnic:
        raise HTTPException(status_code=400, detail="Teacher has no CNIC on file")
    students = db.query(Student).filter(Student.teacher_cnic == current_user.cnic).all()
    return students


def _own_student(db: Session, student_id: str, parent: Parent) -> Student:
    student = db.query(Student).filter(Student.id == student_id, Student.parent_id == parent.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str,
    body: UpdateStudentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("parent")),
):
    parent = _require_parent(db, current_user)
    student = _own_student(db, student_id, parent)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=204)
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("parent")),
):
    parent = _require_parent(db, current_user)
    student = _own_student(db, student_id, parent)
    db.delete(student)
    db.commit()


@router.post("/{student_id}/regenerate-qr", response_model=StudentResponse)
def regenerate_qr(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("parent")),
):
    parent = _require_parent(db, current_user)
    student = _own_student(db, student_id, parent)
    student.qr_hash = Student.generate_qr_hash(student.id)
    db.commit()
    db.refresh(student)
    return student
