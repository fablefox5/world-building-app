from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:8000",
}

def _cors_headers(request: Request) -> dict:
    origin = request.headers.get("origin")
    if origin in ALLOWED_ORIGINS:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Vary": "Origin",
        }
    return {}

async def custom_validation_exception_handler(request: Request, exc: RequestValidationError):
    formatted_errors = {}

    for error in exc.errors():
        field_name = error["loc"][-1] if error["loc"] else "body"
        message = f"The '{field_name}' field is required." if error["type"] == "missing" else error["msg"]
        formatted_errors[field_name] = message

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error_code": "INVALID_PAYLOAD",
            "message": "Validation failed on data submission",
            "fields": formatted_errors,
        },
        headers=_cors_headers(request),
    )

def register_custom_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, custom_validation_exception_handler)