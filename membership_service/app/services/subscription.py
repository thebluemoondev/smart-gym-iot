from sqlalchemy.orm import Session
from app.models.subscription import Subscription
from app.schemas.subscription import SubscriptionCreate
from datetime import datetime, timedelta

def create_subscription(db: Session, sub: SubscriptionCreate):
    # Ở đây sau này có thể thêm logic kiểm tra xem User có đang trong gói nào không
    new_sub = Subscription(**sub.model_dump())
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return new_sub

def get_user_subscriptions(db: Session, user_id: int):
    return db.query(Subscription).filter(Subscription.user_id == user_id).all()

def get_subscription_by_id(db: Session, sub_id: int):
    return db.query(Subscription).filter(Subscription.id == sub_id).first()

def get_all_subscriptions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Subscription) \
             .order_by(Subscription.id.desc()) \
             .offset(skip) \
             .limit(limit) \
             .all()