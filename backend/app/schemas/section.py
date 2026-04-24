from pydantic import BaseModel


class StudentBrief(BaseModel):
    id: str
    name: str
    parent_id: str | None

    model_config = {"from_attributes": True}


class TeacherBrief(BaseModel):
    id: str
    name: str
    email: str

    model_config = {"from_attributes": True}


class SectionDetailResponse(BaseModel):
    id: str
    name: str
    class_id: str
    teacher: TeacherBrief | None
    students: list[StudentBrief]

    model_config = {"from_attributes": True}
