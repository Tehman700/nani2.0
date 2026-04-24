import uuid
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Section(Base):
    __tablename__ = "sections"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    class_id: Mapped[str] = mapped_column(String, ForeignKey("classes.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)

    class_: Mapped["Class"] = relationship("Class", back_populates="sections")
    students: Mapped[list["Student"]] = relationship("Student", back_populates="section")
    users: Mapped[list["User"]] = relationship("User", back_populates="section")
