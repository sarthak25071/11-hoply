"""Seed the `locations` catalog with a set of well-known Indian places.

Run from the ``backend`` directory so the ``app`` package is importable:

    python -m scripts.seed_locations

The script is idempotent: locations already present (matched on name + city)
are skipped, so it is safe to run repeatedly.
"""

from __future__ import annotations

from app.core.database import SessionLocal
from app.crud import location as location_crud
from app.models.location import PlaceType
from app.schemas.location import Coordinates, LocationInput

_COUNTRY = "India"

# City name constants (kept in one place to avoid scattered string literals).
_BENGALURU = "Bengaluru"
_NEW_DELHI = "New Delhi"
_MUMBAI = "Mumbai"
_CHENNAI = "Chennai"
_HYDERABAD = "Hyderabad"
_KOLKATA = "Kolkata"
_PUNE = "Pune"

# Compact seed rows: (name, region, city, place_type, latitude, longitude).
# Coordinates are approximate (WGS-84).
_SEED_ROWS: list[tuple[str, str, str, PlaceType, float, float]] = [
    # ---- Airports ----
    ("Kempegowda International Airport", "Devanahalli", _BENGALURU, PlaceType.airport, 13.198795, 77.706299),
    ("Indira Gandhi International Airport", "Palam", _NEW_DELHI, PlaceType.airport, 28.556160, 77.100281),
    ("Chhatrapati Shivaji Maharaj International Airport", "Andheri East", _MUMBAI, PlaceType.airport, 19.088699, 72.867912),
    ("Chennai International Airport", "Meenambakkam", _CHENNAI, PlaceType.airport, 12.994444, 80.180664),
    ("Rajiv Gandhi International Airport", "Shamshabad", _HYDERABAD, PlaceType.airport, 17.240831, 78.429382),
    ("Netaji Subhas Chandra Bose International Airport", "Dum Dum", _KOLKATA, PlaceType.airport, 22.654699, 88.446701),
    ("Pune Airport", "Lohegaon", _PUNE, PlaceType.airport, 18.582111, 73.919701),
    # ---- Railway stations ----
    ("KSR Bengaluru City Junction", "Majestic", _BENGALURU, PlaceType.railway_station, 12.977500, 77.570000),
    ("New Delhi Railway Station", "Paharganj", _NEW_DELHI, PlaceType.railway_station, 28.643999, 77.219238),
    ("Chhatrapati Shivaji Maharaj Terminus", "Fort", _MUMBAI, PlaceType.railway_station, 18.940001, 72.834717),
    ("Chennai Central", "Park Town", _CHENNAI, PlaceType.railway_station, 13.082680, 80.275398),
    ("Secunderabad Junction", "Secunderabad", _HYDERABAD, PlaceType.railway_station, 17.433001, 78.501099),
    ("Howrah Junction", "Howrah", _KOLKATA, PlaceType.railway_station, 22.583500, 88.342300),
    ("Pune Junction", "Agarkar Nagar", _PUNE, PlaceType.railway_station, 18.528601, 73.874199),
    # ---- Bus depots ----
    ("Kempegowda Bus Station (Majestic)", "Majestic", _BENGALURU, PlaceType.bus_depot, 12.977200, 77.571800),
    ("Kashmere Gate ISBT", "Kashmere Gate", _NEW_DELHI, PlaceType.bus_depot, 28.667700, 77.229797),
    ("Dadar Bus Depot", "Dadar", _MUMBAI, PlaceType.bus_depot, 19.018600, 72.844696),
    ("Koyambedu Bus Terminus", "Koyambedu", _CHENNAI, PlaceType.bus_depot, 13.069500, 80.196800),
    # ---- Metro stations ----
    ("MG Road Metro Station", "MG Road", _BENGALURU, PlaceType.metro_station, 12.975700, 77.606400),
    ("Rajiv Chowk Metro Station", "Connaught Place", _NEW_DELHI, PlaceType.metro_station, 28.632999, 77.219398),
    ("Ghatkopar Metro Station", "Ghatkopar", _MUMBAI, PlaceType.metro_station, 19.086000, 72.908600),
    # ---- Localities ----
    ("Koramangala", "South Bengaluru", _BENGALURU, PlaceType.locality, 12.935200, 77.624500),
    ("Whitefield", "East Bengaluru", _BENGALURU, PlaceType.locality, 12.969800, 77.749900),
    ("Bandra", "Western Suburbs", _MUMBAI, PlaceType.locality, 19.054000, 72.840500),
    ("Hitech City", "Madhapur", _HYDERABAD, PlaceType.locality, 17.446800, 78.379700),
    ("Salt Lake Sector V", "Bidhannagar", _KOLKATA, PlaceType.locality, 22.570700, 88.433700),
]


def _build_seed_locations() -> list[LocationInput]:
    """Expand the compact seed rows into validated ``LocationInput`` objects."""
    return [
        LocationInput(
            name=name,
            region=region,
            city=city,
            country=_COUNTRY,
            type=place_type,
            coordinates=Coordinates(latitude=latitude, longitude=longitude),
        )
        for name, region, city, place_type, latitude, longitude in _SEED_ROWS
    ]


def seed() -> None:
    """Insert any missing seed locations, skipping ones that already exist."""
    db = SessionLocal()
    created = 0
    skipped = 0
    try:
        for entry in _build_seed_locations():
            if location_crud.get_by_name_city(db, entry.name, entry.city):
                skipped += 1
                continue
            location_crud.create(db, entry)
            created += 1
    finally:
        db.close()

    print(f"Seed complete: {created} created, {skipped} skipped.")


if __name__ == "__main__":
    seed()
