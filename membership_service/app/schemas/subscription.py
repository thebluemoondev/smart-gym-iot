from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class SubscriptionBase(BaseModel):
    user_id: int
    package_id: int
    start_date: date
    end_date: date
    status: Optional[str] = "active"

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionOut(SubscriptionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)