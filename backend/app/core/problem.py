"""RFC 9457 Problem Details error handling.

Registers exception handlers so all errors are returned as
``application/problem+json`` bodies, matching the OpenAPI contract.
"""

from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

PROBLEM_MEDIA_TYPE = "application/problem+json"


def _problem(
    status_code: int,
    detail: str | None = None,
    *,
    title: str | None = None,
    errors: list[dict] | None = None,
    instance: str | None = None,
) -> JSONResponse:
    """Build a standardised RFC 9457 problem+json response so all errors share one shape."""
    body: dict = {
        "type": "about:blank",
        "title": title or HTTPStatus(status_code).phrase,
        "status": status_code,
    }
    if detail:
        body["detail"] = detail
    if errors:
        body["errors"] = errors
    if instance:
        body["instance"] = instance
    return JSONResponse(status_code=status_code, content=body, media_type=PROBLEM_MEDIA_TYPE)


def _http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Convert raised HTTPExceptions into problem+json so clients get consistent error bodies."""
    detail = exc.detail if isinstance(exc.detail, str) else None
    return _problem(exc.status_code, detail, instance=str(request.url.path))


def _validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Turn request-validation failures into a 422 problem+json listing each invalid field."""
    errors = [
        {"field": ".".join(str(p) for p in err["loc"][1:]), "detail": err["msg"]}
        for err in exc.errors()
    ]
    return _problem(
        422,
        "One or more fields failed validation.",
        title="Unprocessable Entity",
        errors=errors,
        instance=str(request.url.path),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Attach the Problem Details handlers to the FastAPI app."""
    app.add_exception_handler(StarletteHTTPException, _http_exception_handler)
    app.add_exception_handler(RequestValidationError, _validation_exception_handler)
