from sqlalchemy.orm import Session
from app.models.package import GymPackage
from app.schemas.package import PackageCreate, PackageUpdate

def get_packages(db: Session):
    return db.query(GymPackage).all()

def get_package_by_id(db: Session, package_id: int):
    return db.query(GymPackage).filter(GymPackage.id == package_id).first()

def create_package(db: Session, package: PackageCreate):
    db_package = GymPackage(**package.model_dump())
    db.add(db_package)
    db.commit()
    db.refresh(db_package)
    return db_package

def update_package(db: Session, package_id: int, package_data: PackageUpdate):
    db_package = get_package_by_id(db, package_id)
    if not db_package:
        return None

    data = package_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_package, key, value)

    db.commit()
    db.refresh(db_package)
    return db_package

def delete_package(db: Session, package_id: int):
    db_package = get_package_by_id(db, package_id)
    if db_package:
        db.delete(db_package)
        db.commit()
    return db_package