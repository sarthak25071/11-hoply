"""Location schemas (mirrors Location / LocationInput in openapi.yaml)."""

from datetime import datetime

from app.models.location import PlaceType
from app.schemas.base import CamelModel, Page
from pydantic import Field, field_serializer


class Coordinates(CamelModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class LocationInput(CamelModel):
    name: str = Field(min_length=1, max_length=150)
    region: str = Field(min_length=1, max_length=100)
    city: str = Field(min_length=1, max_length=100)
    country: str = Field(min_length=1, max_length=100)
    type: PlaceType
    coordinates: Coordinates | None = None


class Location(CamelModel):
    location_id: int
    name: str
    region: str
    city: str
    country: str
    type: PlaceType
    coordinates: Coordinates | None = None
    created_at: datetime

    @field_serializer("location_id")
    def _serialize_location_id(self, value: int) -> str:
        # IDs are opaque strings in the API contract.
        return str(value)


class LocationPage(Page):
    items: list[Location]
