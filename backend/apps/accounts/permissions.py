from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allows access only to admin users."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class IsAuthorRole(BasePermission):
    """Allows access to users with author or admin role."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("author", "admin")


class IsOwnerOrAdmin(BasePermission):
    """Object-level: allows the post author or any admin."""

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return hasattr(obj, "author") and obj.author_id == request.user.id
