from pydantic import BaseModel


class AddStudentRequest(BaseModel):
    name: str
    roll_number: str
    photo_url: str | None = None
    class_name: str
    section_name: str
    teacher_name: str
    teacher_cnic: str
    section_id: str | None = None


class StudentResponse(BaseModel):
    id: str
    name: str
    roll_number: str | None
    photo_url: str | None
    qr_hash: str | None
    class_name: str | None
    section_name: str | None
    teacher_name: str | None
    teacher_cnic: str | None
    section_id: str | None

    model_config = {"from_attributes": True}


class UpdateStudentRequest(BaseModel):
    name: str | None = None
    roll_number: str | None = None
    photo_url: str | None = None
    class_name: str | None = None
    section_name: str | None = None
    teacher_name: str | None = None
    teacher_cnic: str | None = None


class TeacherStudentView(BaseModel):
    id: str
    name: str
    roll_number: str | None
    photo_url: str | None

    model_config = {"from_attributes": True}
