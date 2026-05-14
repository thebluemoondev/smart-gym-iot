from datetime import date

from sqlalchemy.orm import Session

from app.models.subscription import Subscription
from app.schemas.subscription import SubscriptionCreate


def create_subscription(db: Session, sub: SubscriptionCreate):
    sub_dict = sub.model_dump()

    if isinstance(sub_dict.get('start_date'), str):
        sub_dict['start_date'] = date.fromisoformat(sub_dict['start_date'])
    if isinstance(sub_dict.get('end_date'), str):
        sub_dict['end_date'] = date.fromisoformat(sub_dict['end_date'])

    start_date = sub_dict.get('start_date') or date.today()
    end_date = sub_dict.get('end_date')

    if not end_date:
        raise ValueError("end_date không được để trống")

    try:
        # Đóng toàn bộ gói active cũ của user trước khi tạo gói mới.
        active_subscriptions = db.query(Subscription).filter(
            Subscription.user_id == sub_dict['user_id'],
            Subscription.status == "active"
        ).all()
        for active in active_subscriptions:
            active.status = "expired"
            if active.end_date and active.end_date > start_date:
                active.end_date = start_date

        new_sub = Subscription(
            user_id=sub_dict['user_id'],
            package_id=sub_dict['package_id'],
            start_date=start_date,
            end_date=end_date,
            status='active'
        )

        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return new_sub
    except Exception as e:
        db.rollback()
        print(f"Lỗi DB: {e}")
        raise e

def get_user_subscriptions(db: Session, user_id: int):
    return db.query(Subscription).filter(Subscription.user_id == user_id).order_by(Subscription.id.desc()).all()

def get_subscription_by_id(db: Session, sub_id: int):
    return db.query(Subscription).filter(Subscription.id == sub_id).first()

def get_all_subscriptions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Subscription) \
             .order_by(Subscription.id.desc()) \
             .offset(skip) \
             .limit(limit) \
             .all()

def get_active_subscription_by_user(db: Session, user_id: int):
    return db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == "active"
    ).order_by(Subscription.id.desc()).first()
