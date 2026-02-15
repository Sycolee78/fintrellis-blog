from common.exceptions import ServiceError


class DuplicateSlugError(ServiceError):
    default_detail = "A post with this slug already exists."


class InvalidStatusTransitionError(ServiceError):
    default_detail = "Invalid status transition."
