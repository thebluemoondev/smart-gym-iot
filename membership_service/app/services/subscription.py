from sqlalchemy.orm import Session
from app.models.subscription import Subscription
from app.schemas.subscription import SubscriptionCreate
from datetime import datetime, timedelta

def create_subscription(db: Session, sub: SubscriptionCreate):
    # 1. Lấy dữ liệu từ Schema ra một dictionary
    sub_dict = sub.model_dump()

    # 2. Ép kiểu dữ liệu date (Nếu là chuỗi thì phải chuyển thành object date)
    # Pydantic thường làm hộ, nhưng để chắc chắn cho SQL Server:
    from datetime import date
    if isinstance(sub_dict.get('start_date'), str):
         # Chuyển từ "YYYY-MM-DD" sang object date
         sub_dict['start_date'] = date.fromisoformat(sub_dict['start_date'])

    if isinstance(sub_dict.get('end_date'), str):
         sub_dict['end_date'] = date.fromisoformat(sub_dict['end_date'])

    # 3. Tạo Object Model (Gán thủ công từng trường cho chắc chắn)
    new_sub = Subscription(
        user_id=sub_dict['user_id'],
        package_id=sub_dict['package_id'],
        start_date=sub_dict.get('start_date') or date.today(),
        end_date=sub_dict.get('end_date'),
        status=sub_dict.get('status', 'active')
    )

    try:
        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return new_sub
    except Exception as e:
        db.rollback()
        print(f"Lỗi DB: {e}") # Để bạn xem lỗi thực sự trong log Docker
        raise e

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

def get_active_subscription_by_user(db: Session, user_id: int):
    return db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == "active"
    ).first()