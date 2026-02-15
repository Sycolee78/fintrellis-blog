from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


def _get_error_code(exc):
    """Map exception class to a machine-readable error code."""
    code_map = {
        "ValidationError": "VALIDATION_ERROR",
        "NotFound": "NOT_FOUND",
        "PermissionDenied": "PERMISSION_DENIED",
        "AuthenticationFailed": "AUTHENTICATION_FAILED",
        "MethodNotAllowed": "METHOD_NOT_ALLOWED",
        "Throttled": "THROTTLED",
    }
    return code_map.get(exc.__class__.__name__, "SERVER_ERROR")


def _get_error_message(exc):
    """Return a human-readable error summary."""
    if hasattr(exc, "detail"):
        if isinstance(exc.detail, str):
            return exc.detail
        if isinstance(exc.detail, list):
            return exc.detail[0] if exc.detail else "An error occurred."
    return "One or more fields failed validation."


def custom_exception_handler(exc, context):
    """Wrap DRF's default exception handler with a consistent error envelope."""
    response = exception_handler(exc, context)

    if response is not None:
        details = response.data
        if isinstance(details, list):
            details = {"detail": details}

        response.data = {
            "error": {
                "code": _get_error_code(exc),
                "message": _get_error_message(exc),
                "details": details,
            }
        }

    return response


class ServiceError(APIException):
    """Raised by the service layer for business-rule violations."""

    status_code = 400
    default_detail = "A business rule was violated."
    default_code = "service_error"
