"""CRUD operations for the Location model."""

from app.models.location import Location, PlaceType
from app.schemas.location import LocationInput
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session


def get_by_id(db: Session, location_id: int) -> Location | None:
    """Fetch a location by primary key."""
    return db.get(Location, location_id)


def get_by_name_city(db: Session, name: str, city: str) -> Location | None:
    """Look up a location by its (name, city) pair to enforce catalog uniqueness."""
    return db.scalar(
        select(Location).where(Location.name == name, Location.city == city)
    )


def search(
    db: Session,
    *,
    q: str | None = None,
    region: str | None = None,
    city: str | None = None,
    country: str | None = None,
    place_type: PlaceType | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Location], int]:
    """Return a filtered, paginated page of locations and the total match count."""
    stmt: Select = select(Location)

    if q:
        stmt = stmt.where(Location.name.ilike(f"%{q}%"))
    if region:
        stmt = stmt.where(Location.region == region)
    if city:
        stmt = stmt.where(Location.city == city)
    if country:
        stmt = stmt.where(Location.country == country)
    if place_type is not None:
        stmt = stmt.where(Location.place_type == place_type)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(
        stmt.order_by(Location.name).offset((page - 1) * limit).limit(limit)
    ).all()
    return list(rows), int(total)


def create(db: Session, data: LocationInput) -> Location:
    """Persist a new location, splitting the coordinates object into lat/lng columns."""
    location = Location(
        name=data.name,
        region=data.region,
        city=data.city,
        country=data.country,
        place_type=data.type,
        latitude=data.coordinates.latitude if data.coordinates else None,
        longitude=data.coordinates.longitude if data.coordinates else None,
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location
