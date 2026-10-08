from rest_framework.permissions import BasePermission


def role_required(role):
    """Permission class allowing only users whose profile has the given role."""

    class _RolePermission(BasePermission):
        message = f"Only {role}s can do this."

        def has_permission(self, request, view):
            profile = getattr(request.user, "profile", None)
            return bool(profile and profile.role == role)

    _RolePermission.__name__ = f"Is{role.title()}"
    return _RolePermission
