"""Shared Pydantic base model.

Serialises/parses using camelCase field names (the REST/JSON convention used in
the OpenAPI spec) while keeping snake_case attributes in Python.
"""

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class Page(CamelModel):
    """Pagination envelope shared by all collection responses."""

    page: int
    limit: int
    total_items: int
    total_pages: int
