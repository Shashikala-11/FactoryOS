
from types import SimpleNamespace

from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory

from .models import User
from .permissions import (
    HasFactoryRole,
    IsDispatchStaff,
    IsFactoryAdmin,
    IsInspector,
    IsProductionOperator,
    IsSupervisor,
)


class TestInspectorPermission(HasFactoryRole):
    allowed_roles = (User.Role.INSPECTOR,)


class FactoryRolePermissionTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.request = self.factory.get("/test/")

    def make_user(
        self,
        role,
        *,
        authenticated=True,
        superuser=False,
    ):
        return SimpleNamespace(
            is_authenticated=authenticated,
            is_superuser=superuser,
            role=role,
        )

    def allowed(self, permission_class, user):
        self.request.user = user
        return permission_class().has_permission(
            self.request, None
        )

    def test_inspector_can_access_inspector_endpoint(self):
        user = self.make_user(User.Role.INSPECTOR)

        self.assertTrue(
            self.allowed(TestInspectorPermission, user)
        )

    def test_inspector_cannot_access_supervisor_endpoint(self):
        user = self.make_user(User.Role.INSPECTOR)

        self.assertFalse(
            self.allowed(IsSupervisor, user)
        )

    def test_supervisor_can_access_supervisor_endpoint(self):
        user = self.make_user(User.Role.SUPERVISOR)

        self.assertTrue(
            self.allowed(IsSupervisor, user)
        )

    def test_roles_are_restricted_to_their_own_endpoints(self):
        cases = [
            (User.Role.INSPECTOR, IsInspector),
            (User.Role.PRODUCTION, IsProductionOperator),
            (User.Role.DISPATCH, IsDispatchStaff),
        ]

        for role, permission_class in cases:
            with self.subTest(role=role):
                user = self.make_user(role)
                self.assertTrue(
                    self.allowed(permission_class, user)
                )

    def test_unauthenticated_user_is_denied(self):
        user = self.make_user(
            User.Role.INSPECTOR,
            authenticated=False,
        )

        self.assertFalse(
            self.allowed(IsInspector, user)
        )

    def test_factory_admin_can_access_role_protected_endpoint(self):
        user = self.make_user(User.Role.ADMIN)

        self.assertTrue(
            self.allowed(IsSupervisor, user)
        )

    def test_only_admin_or_superuser_can_access_admin_endpoint(self):
        inspector = self.make_user(User.Role.INSPECTOR)
        superuser = self.make_user(
            User.Role.INSPECTOR,
            superuser=True,
        )

        self.assertFalse(
            self.allowed(IsFactoryAdmin, inspector)
        )
        self.assertTrue(
            self.allowed(IsFactoryAdmin, superuser)
        )
