import enum


class UserRole(str, enum.Enum):
    parent = "parent"
    teacher = "teacher"
    branch_admin = "branch_admin"
    super_admin = "super_admin"
