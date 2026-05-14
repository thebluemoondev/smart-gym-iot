"""
Module RFID Access Log Schema
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class RFIDAccessLogOut(BaseModel):
    id: int
    card_uid: str
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    access_granted: bool
    reason: Optional[str] = None
    checked_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
