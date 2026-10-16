
from rest_framework.permissions import BasePermission

from .models import User


class HasFactoryRole(BasePermission):
    """
    Allows users with specified FactoryOS roles.
    Django superusers and FactoryOS admins can access all
    role-protected endpoints.
    """

    allowed_roles = ()

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser or user.role == User.Role.ADMIN:
            return True

        return user.role in self.allowed_roles


class IsFactoryAdmin(HasFactoryRole):
    """
    Restricts access to FactoryOS administrators.
    """

    allowed_roles = (User.Role.ADMIN,)


class IsSupervisor(HasFactoryRole):
    allowed_roles = (User.Role.SUPERVISOR,)


class IsInspector(HasFactoryRole):
    allowed_roles = (User.Role.INSPECTOR,)


class IsProductionOperator(HasFactoryRole):
    allowed_roles = (User.Role.PRODUCTION,)


class IsDispatchStaff(HasFactoryRole):
    allowed_roles = (User.Role.DISPATCH,)
