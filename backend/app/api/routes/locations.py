"""Location routes: catalog search, creation and retrieval.

Implements:
  GET  /locations               -> listLocations
  POST /locations               -> createLocation
  GET  /locations/{locationId}  -> getLocationById
"""

from math import ceil
from typing import Annotated

from app.api.deps import get_db
from app.crud import location as location_crud
from app.models.location import Location as LocationModel
from app.models.location import PlaceType
from app.schemas.location import Location, LocationInput, LocationPage
from fastapi import (APIRouter, Depends, HTTPException, Query, Request,
                     Response, status)
from sqlalchemy.orm import Session

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]


@router.get(
    "",
    summary="List / search locations",
    operation_id="listLocations",
)
def list_locations(
    db: DbSession,
    q: Annotated[
        str | None,
        Query(max_length=150, description="Free-text search over location name."),
    ] = None,
    region: Annotated[
        str | None, Query(description="Filter by broader area / district.")
    ] = None,
    city: Annotated[str | None, Query(description="Filter by city.")] = None,
    country: Annotated[str | None, Query(description="Filter by country.")] = None,
    type: Annotated[
        PlaceType | None, Query(description="Filter by place type.")
    ] = None,
    page: Annotated[int, Query(ge=1, description="1-based page number.")] = 1,
    limit: Annotated[int, Query(ge=1, le=100, description="Items per page.")] = 20,
) -> LocationPage:
    """Return a filtered, paginated page of locations so travellers can pick source/destination."""
    items, total = location_crud.search(
        db,
        q=q,
        region=region,
        city=city,
        country=country,
        place_type=type,
        page=page,
        limit=limit,
    )
    return LocationPage(
        items=[Location.model_validate(item) for item in items],
        page=page,
        limit=limit,
        total_items=total,
        total_pages=ceil(total / limit) if total else 0,
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create a location",
    operation_id="createLocation",
)
def create_location(
    payload: LocationInput,
    request: Request,
    response: Response,
    db: DbSession,
) -> Location:
    """Add a new place to the catalog; rejects duplicates of the same name within a city."""
    if location_crud.get_by_name_city(db, payload.name, payload.city):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A location with this name already exists in this city.",
        )

    location = location_crud.create(db, payload)
    response.headers["Location"] = str(
        request.url_for("get_location_by_id", location_id=location.location_id)
    )
    return Location.model_validate(location)


@router.get(
    "/{location_id}",
    summary="Get a location",
    operation_id="getLocationById",
)
def get_location_by_id(location_id: str, db: DbSession) -> Location:
    """Return a single location by its opaque id."""
    location = _get_location_or_404(db, location_id)
    return Location.model_validate(location)


def _get_location_or_404(db: Session, location_id: str) -> LocationModel:
    """Resolve an opaque string location id to a stored location or raise 404."""
    try:
        primary_key = int(location_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found.",
        ) from None

    location = location_crud.get_by_id(db, primary_key)
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found.",
        )
    return location
