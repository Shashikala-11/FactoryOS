
from django.db import IntegrityError, transaction
from django.test import TestCase

from .models import Factory, Department


class FactoryModelTests(TestCase):
    def test_factory_creation(self):
        factory = Factory.objects.create(
            name="Mumbai Plant",
            code="MUM-001",
            address="Mumbai, Maharashtra",
        )

        self.assertEqual(factory.name, "Mumbai Plant")
        self.assertEqual(factory.code, "MUM-001")
        self.assertTrue(factory.is_active)

    def test_factory_code_must_be_unique(self):
        Factory.objects.create(name="Plant One", code="PLANT-001")

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Factory.objects.create(
                    name="Plant Two",
                    code="PLANT-001",
                )

    def test_department_belongs_to_factory(self):
        factory = Factory.objects.create(
            name="Mumbai Plant",
            code="MUM-001",
        )
        department = Department.objects.create(
            factory=factory,
            name="Quality Control",
            code="QC",
        )

        self.assertEqual(department.factory, factory)
        self.assertIn(department, factory.departments.all())

    def test_department_codes_must_be_unique_within_factory(self):
        factory = Factory.objects.create(
            name="Mumbai Plant",
            code="MUM-001",
        )
        Department.objects.create(
            factory=factory,
            name="Quality Control",
            code="QC",
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Department.objects.create(
                    factory=factory,
                    name="Production Quality",
                    code="QC",
                )

    def test_same_department_code_allowed_in_different_factories(self):
        factory_one = Factory.objects.create(
            name="Mumbai Plant",
            code="MUM-001",
        )
        factory_two = Factory.objects.create(
            name="Pune Plant",
            code="PUN-001",
        )

        Department.objects.create(
            factory=factory_one,
            name="Quality Control",
            code="QC",
        )
        Department.objects.create(
            factory=factory_two,
            name="Quality Control",
            code="QC",
        )

        self.assertEqual(Department.objects.count(), 2)

    def test_factory_cannot_be_deleted_while_departments_exist(self):
        factory = Factory.objects.create(
            name="Mumbai Plant",
            code="MUM-001",
        )
        Department.objects.create(
            factory=factory,
            name="Quality Control",
            code="QC",
        )

        with self.assertRaises(Exception):
            factory.delete()
