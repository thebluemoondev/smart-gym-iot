"""
File: user.py

Chức năng chính:
    Cung cấp các dịch vụ (service) để quản lý người dùng:
        - Lấy danh sách người dùng
        - Lấy thông tin theo ID / username
        - Tạo mới người dùng
        - Cập nhật thông tin
        - Xóa người dùng
        - Tìm kiếm người dùng

Mô tả module:
    Module xử lý logic nghiệp vụ liên quan đến người dùng.
    Sử dụng SQLAlchemy để thao tác với database và schema để nhận dữ liệu đầu vào.

    Nguyên tắc:
        - Mật khẩu phải được băm trước khi lưu
        - Chỉ cập nhật các trường được cung cấp
        - Trả về None nếu không tìm thấy dữ liệu

Tác giả: <manh64>
Ngày cập nhật gần nhất: <5/6/2026>
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import user as model
from app.schemas import user as schema
from app.services.security import hash_password


def get_all_users(db: Session):
    """
    Lấy toàn bộ danh sách người dùng.

    Args:
        db (Session): Kết nối database.

    Returns:
        List[User]: Danh sách tất cả người dùng.
    """
    return db.query(model.User).all()


def get_user(id: int, db: Session):
    """
    Lấy thông tin người dùng theo ID.

    Args:
        id (int): ID người dùng.
        db (Session): Kết nối database.

    Returns:
        User | None: Người dùng nếu tìm thấy, ngược lại None.
    """
    return db.query(model.User).filter(model.User.id == id).first()


def create_user(user: schema.CreateUser, db: Session):
    """
    Tạo người dùng mới.

    Args:
        user (CreateUser): Dữ liệu người dùng.
        db (Session): Kết nối database.

    Returns:
        User: Người dùng vừa tạo.
    """
    hashed_pwd = hash_password(user.password)

    new_user = model.User(
        name=user.name,
        username=user.username,
        password=hashed_pwd,
        phonenumber=user.phonenumber
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def delete_user(id: int, db: Session):
    """
    Xóa người dùng theo ID.

    Args:
        id (int): ID người dùng.
        db (Session): Kết nối database.

    Returns:
        User | None: Người dùng đã xóa hoặc None nếu không tồn tại.
    """
    user = db.query(model.User).filter(model.User.id == id).first()
    if not user:
        return None

    db.delete(user)
    db.commit()
    return user


def update_user(id: int, user: schema.UpdateUser, db: Session):
    """
    Cập nhật thông tin người dùng.

    Args:
        id (int): ID người dùng.
        user (UpdateUser): Dữ liệu cần cập nhật.
        db (Session): Kết nối database.

    Returns:
        User | None: Người dùng đã cập nhật hoặc None nếu không tồn tại.
    """
    db_user = get_user(id, db)
    if not db_user:
        return None

    update_data = user.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        if key == "password":
            setattr(db_user, key, hash_password(value))
        else:
            setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_username(username: str, db: Session):
    """
    Lấy người dùng theo username.

    Args:
        username (str): Tên đăng nhập.
        db (Session): Kết nối database.

    Returns:
        User | None: Người dùng nếu tìm thấy, ngược lại None.
    """
    return db.query(model.User).filter(model.User.username == username).first()


def search_users(db: Session, query: str):
    """
    Tìm kiếm người dùng theo tên hoặc số điện thoại.

    Args:
        db (Session): Kết nối database.
        query (str): Từ khóa tìm kiếm.

    Returns:
        List[User]: Danh sách người dùng phù hợp.
    """
    return db.query(model.User).filter(
        or_(
            model.User.name.contains(query),
            model.User.phonenumber.contains(query)
        )
    ).all()