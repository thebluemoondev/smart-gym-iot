"""
File: user.py

Chức năng chính:
    Cung cấp các dịch vụ (service) để quản lý người dùng:
        - Lấy danh sách người dùng
        - Lấy thông tin theo ID / username
        - Tạo mới người dùng (đăng ký)
        - Đăng nhập
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
from app.services.security import hash_password, verify_password, create_access_token


def get_all_users(db: Session):
    """
    Lấy toàn bộ danh sách người dùng.
    """
    return db.query(model.User).all()


def get_user(id: int, db: Session):
    """
    Lấy thông tin người dùng theo ID.
    """
    return db.query(model.User).filter(model.User.id == id).first()


def create_user(user: schema.CreateUser, db: Session):
    """
    Tạo người dùng mới (đăng ký).
    """
    hashed_pwd = hash_password(user.password)

    new_user = model.User(
        username=user.username,
        password=hashed_pwd,
        name=user.full_name or user.name,
        email=user.email,
        phonenumber=user.phone or user.phonenumber,
        full_name=user.full_name,
        date_of_birth=user.date_of_birth,
        gender=user.gender,
        address=user.address
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def delete_user(id: int, db: Session):
    """
    Xóa người dùng theo ID.
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
    """
    return db.query(model.User).filter(model.User.username == username).first()


def search_users(db: Session, query: str):
    """
    Tìm kiếm người dùng theo tên hoặc số điện thoại.
    """
    return db.query(model.User).filter(
        or_(
            model.User.name.contains(query),
            model.User.full_name.contains(query),
            model.User.phonenumber.contains(query),
            model.User.phone.contains(query)
        )
    ).all()


def authenticate_user(username: str, password: str, db: Session):
    """
    Xác thực người dùng đăng nhập.

    Args:
        username: Tên đăng nhập
        password: Mật khẩu
        db: Session database

    Returns:
        User nếu đăng nhập thành công, None nếu thất bại
    """
    user = get_user_by_username(username, db)
    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user


def login_user(user: schema.LoginRequest, db: Session):
    """
    Đăng nhập người dùng và trả về token.

    Args:
        user: Thông tin đăng nhập
        db: Session database

    Returns:
        Dict chứa token và thông tin user nếu thành công
        None nếu thất bại
    """
    authenticated_user = authenticate_user(user.username, user.password, db)

    if not authenticated_user:
        return None

    # Tạo JWT token
    access_token = create_access_token(data={"sub": authenticated_user.username, "user_id": authenticated_user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": authenticated_user
    }