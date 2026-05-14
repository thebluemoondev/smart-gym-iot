from sqlalchemy.orm import Session

from app.models.rfid_access_log import RFIDAccessLog
from app.models.user import User


def create_access_log(
    db: Session,
    *,
    card_uid: str,
    user_id: int | None,
    access_granted: bool,
    reason: str | None = None,
):
    log = RFIDAccessLog(
        card_uid=card_uid,
        user_id=user_id,
        access_granted=access_granted,
        reason=reason,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def _serialize_log(log: RFIDAccessLog, user: User | None = None):
    return {
        "id": log.id,
        "card_uid": log.card_uid,
        "user_id": log.user_id,
        "user_name": user.name if user and user.name else None,
        "username": user.username if user else None,
        "phone": user.phonenumber if user else None,
        "access_granted": bool(log.access_granted),
        "reason": log.reason,
        "checked_at": log.checked_at,
    }


def list_access_logs(
    db: Session,
    *,
    user_id: int | None = None,
    card_uid: str | None = None,
    limit: int = 100,
):
    limit = max(1, min(int(limit or 100), 500))
    query = db.query(RFIDAccessLog)
    if user_id is not None:
        query = query.filter(RFIDAccessLog.user_id == user_id)
    if card_uid:
        query = query.filter(RFIDAccessLog.card_uid == card_uid)
    logs = query.order_by(RFIDAccessLog.checked_at.desc(), RFIDAccessLog.id.desc()).limit(limit).all()
    user_ids = {log.user_id for log in logs if log.user_id is not None}
    user_map = {
        user.id: user
        for user in db.query(User).filter(User.id.in_(user_ids)).all()
    } if user_ids else {}
    return [_serialize_log(log, user_map.get(log.user_id)) for log in logs]
