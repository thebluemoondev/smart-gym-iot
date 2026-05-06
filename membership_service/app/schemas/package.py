from pydantic import BaseModel, ConfigDict
from typing import Optional

class PackageBase(BaseModel):
    name: str
    price: int
    package_desc: Optional[str] = None
    duration_days: int

class PackageCreate(PackageBase):
    pass

class PackageUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None
    package_desc: Optional[str] = None
    duration_days: Optional[int] = None

class PackageOut(PackageBase):
    id: int
    model_config = ConfigDict(from_attributes=True)