from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import httpx
import logging

logger = logging.getLogger(__name__)

# ─── Custom exception classes ─────────────────────────────────────────────────

class NotFoundError(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail)

class UnauthorizedError(HTTPException):
    def __init__(self, detail: str = "Not authorized"):
        super().__init__(status_code=401, detail=detail)

class ForbiddenError(HTTPException):
    def __init__(self, detail: str = "Access denied"):
        super().__init__(status_code=403, detail=detail)

class ConflictError(HTTPException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=409, detail=detail)

class BadRequestError(HTTPException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=400, detail=detail)

class ExternalAPIError(HTTPException):
    def __init__(self, service: str, detail: str = None):
        super().__init__(
            status_code=503,
            detail=detail or f"{service} is currently unavailable. Try again later."
        )

# ─── Global exception handlers ────────────────────────────────────────────────

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = " → ".join(str(e) for e in error["loc"] if e != "body")
        errors.append({
            "field": field,
            "message": error["msg"].replace("Value error, ", "")
        })
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation failed", "errors": errors}
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error on {request.url}: {exc}")
    if isinstance(exc, IntegrityError):
        detail = str(exc.orig)
        if "unique" in detail.lower() or "duplicate" in detail.lower():
            return JSONResponse(
                status_code=409,
                content={"detail": "This record already exists"}
            )
    return JSONResponse(
        status_code=500,
        content={"detail": "A database error occurred. Please try again."}
    )

async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."}
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )