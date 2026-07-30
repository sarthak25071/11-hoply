"""API router aggregation.

Each resource group is mounted here under its own URI prefix. Only the Auth
routes are implemented; the remaining resources are stubbed as commented
placeholders so future routers plug in the same way.
"""

from app.api.routes import auth, locations, users
from fastapi import APIRouter

api_router = APIRouter()

# ---- Implemented ----
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(locations.router, prefix="/locations", tags=["Locations"])

# ---- Planned (mount routers here as they are implemented) ----
# from app.api.routes import travel_plans, matches, notifications
# api_router.include_router(travel_plans.router, prefix="/travel-plans", tags=["Travel Plans"])
# api_router.include_router(matches.router, prefix="/matches", tags=["Matches"])
# api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

__all__ = ["api_router"]
