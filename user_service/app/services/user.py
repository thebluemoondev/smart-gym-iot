"""
File: user.py
Chức năng: Quản lý người dùng
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import user as model
from app.schemas import user as schema
from app.services.security import hash_password, verify_password, create_access_token


def get_all_users(db: Session):
    return db.query(model.User).all()


def get_user(id: int, db: Session):
    return db.query(model.User).filter(model.User.id == id).first()


def create_user(user: schema.CreateUser, db: Session):
    hashed_pwd = hash_password(user.password)
    new_user = model.User(
        username=user.username,
        password=hashed_pwd,
        name=user.name,
        phonenumber=user.phone,
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def delete_user(id: int, db: Session):
    user = db.query(model.User).filter(model.User.id == id).first()
    if not user:
        return None
    db.delete(user)
    db.commit()
    return user


def update_user(id: int, user: schema.UpdateUser, db: Session):
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
    return db.query(model.User).filter(model.User.username == username).first()


def search_users(db: Session, query: str):
    return db.query(model.User).filter(
        or_(
            model.User.name.contains(query),
            model.User.phonenumber.contains(query)
        )
    ).all()


def authenticate_user(username: str, password: str, db: Session):
    user = get_user_by_username(username, db)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


def login_user(user: schema.LoginRequest, db: Session):
    authenticated_user = authenticate_user(user.username, user.password, db)
    if not authenticated_user:
        return None
    access_token = create_access_token(data={"sub": authenticated_user.username, "user_id": authenticated_user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": authenticated_user
    }