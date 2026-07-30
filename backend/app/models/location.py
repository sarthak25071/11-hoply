"""Location ORM model (maps to the `locations` table in schema.sql)."""

import enum
from datetime import datetime
from decimal import Decimal

from app.core.database import Base
from sqlalchemy import DECIMAL, BigInteger, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column


class PlaceType(str, enum.Enum):
    airport = "airport"
    railway_station = "railway_station"
    bus_depot = "bus_depot"
    metro_station = "metro_station"
    locality = "locality"
    other = "other"


class Location(Base):
    __tablename__ = "locations"

    location_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="India")
    place_type: Mapped[PlaceType] = mapped_column(
        Enum(PlaceType, values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=PlaceType.locality,
    )
    latitude: Mapped[Decimal | None] = mapped_column(DECIMAL(9, 6), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(DECIMAL(9, 6), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    @property
    def type(self) -> PlaceType:
        """Expose ``place_type`` under the API contract field name ``type``."""
        return self.place_type

    @property
    def coordinates(self) -> dict[str, Decimal] | None:
        """Assemble the optional coordinates value object from the lat/lng columns."""
        if self.latitude is None or self.longitude is None:
            return None
        return {"latitude": self.latitude, "longitude": self.longitude}
