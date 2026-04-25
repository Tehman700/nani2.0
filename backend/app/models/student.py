import uuid
import hashlib
from sqlalchemy import String, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    roll_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(LONGTEXT, nullable=True)
    qr_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True, index=True)
    class_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    section_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    teacher_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    teacher_cnic: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    # FK fields — section_id optional (for queue integration)
    section_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("sections.id"), nullable=True)
    parent_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("parents.id"), nullable=True)

    section: Mapped["Section | None"] = relationship("Section", back_populates="students")
    parent: Mapped["Parent | None"] = relationship("Parent", back_populates="children")

    @staticmethod
    def generate_qr_hash(student_id: str) -> str:
        return hashlib.sha256(f"nani2:{student_id}:{uuid.uuid4()}".encode()).hexdigest()
