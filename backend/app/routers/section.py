from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Section, User, Student
from app.models.enums import UserRole
from app.schemas.section import SectionDetailResponse, TeacherBrief, StudentBrief

router = APIRouter(prefix="/section", tags=["section"])


@router.get("/{section_id}", response_model=SectionDetailResponse)
def get_section(
    section_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    teacher = (
        db.query(User)
        .filter(User.section_id == section_id, User.role == UserRole.teacher)
        .first()
    )

    students = db.query(Student).filter(Student.section_id == section_id).all()

    return SectionDetailResponse(
        id=section.id,
        name=section.name,
        class_id=section.class_id,
        teacher=TeacherBrief.model_validate(teacher) if teacher else None,
        students=[StudentBrief.model_validate(s) for s in students],
    )
