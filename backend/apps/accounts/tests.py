from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Role

User = get_user_model()


class AuthEndpointsTestCase(APITestCase):
    def setUp(self):
        self.admin_role = Role.objects.create(code="admin", name="Administrador")
        self.user = User.objects.create_user(
            email="admin@test.com",
            password="Password123",
            role=self.admin_role,
            first_name="Admin",
            last_name="Test",
        )

    def test_login_returns_tokens(self):
        url = reverse("token_obtain_pair")
        response = self.client.post(
            url,
            {"email": "admin@test.com", "password": "Password123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_me_endpoint_requires_authentication(self):
        url = reverse("me")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)