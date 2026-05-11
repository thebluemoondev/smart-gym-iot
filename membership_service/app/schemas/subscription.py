from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class SubscriptionBase(BaseModel):
    user_id: int
    package_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = "active"

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionOut(SubscriptionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)