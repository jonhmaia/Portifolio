from django.test import TestCase, Client
from django.urls import reverse
from django.conf import settings
from unittest.mock import patch, MagicMock
import requests # Import requests for requests.Response

# Potentially your utility function if not auto-imported by structure
from .utils import make_supabase_request, buscar_projetos_supabase # Added buscar_projetos_supabase for mocking in ProjetosViewTests
# Your models if needed for other tests, but not strictly for these
# from .models import SobreMim

class SupabaseUtilsTests(TestCase):
    def setUp(self):
        # Configure settings for Supabase if not already set for tests
        if not hasattr(settings, 'SUPABASE_URL'):
            settings.SUPABASE_URL = 'http://fake.supabase.co'
        if not hasattr(settings, 'SUPABASE_KEY'):
            settings.SUPABASE_KEY = 'fakekey'

    @patch('requests.request') # Mock the actual HTTP call
    def test_make_supabase_request_get(self, mock_request):
        mock_response = MagicMock(spec=requests.Response)
        mock_response.status_code = 200
        mock_response.json.return_value = {"data": "success"}
        mock_request.return_value = mock_response

        endpoint = "test_endpoint?param=value"
        response = make_supabase_request(method="GET", endpoint=endpoint)

        expected_url = f"{settings.SUPABASE_URL}/rest/v1/{endpoint}"
        expected_headers = {
            "apikey": settings.SUPABASE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_KEY}",
        }
        mock_request.assert_called_once_with("GET", expected_url, headers=expected_headers, json=None, params=None)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"data": "success"})

    @patch('requests.request')
    def test_make_supabase_request_post(self, mock_request):
        mock_response = MagicMock(spec=requests.Response)
        mock_response.status_code = 201
        mock_response.json.return_value = {"id": 1, "name": "test"}
        mock_request.return_value = mock_response

        endpoint = "another_endpoint"
        payload = {"name": "test_payload"}
        response = make_supabase_request(method="POST", endpoint=endpoint, data=payload)

        expected_url = f"{settings.SUPABASE_URL}/rest/v1/{endpoint}"
        expected_headers = {
            "apikey": settings.SUPABASE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        mock_request.assert_called_once_with("POST", expected_url, headers=expected_headers, json=payload, params=None)
        self.assertEqual(response.status_code, 201)

class ProjetosViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        # Ensure SUPABASE_URL and SUPABASE_KEY are set in settings for tests
        # If they are not, Django might complain when resolving settings.SUPABASE_URL
        # Consider using override_settings if they are not part of the default test environment
        if not hasattr(settings, 'SUPABASE_URL'):
            settings.SUPABASE_URL = 'http://fake.supabase.co'
        if not hasattr(settings, 'SUPABASE_KEY'):
            settings.SUPABASE_KEY = 'fakekey'
        # Also ensure SUPABASE_TABLE is set, as it's used by buscar_projetos_supabase
        if not hasattr(settings, 'SUPABASE_TABLE'):
            settings.SUPABASE_TABLE = 'fake_table'


    @patch('core.views.buscar_projetos_supabase') # Mock the function that hits Supabase in views
    # Note: The instruction says @patch('core.views.buscar_projetos_supabase')
    # but buscar_projetos_supabase is imported and used in core.views.
    # The actual call to Supabase is in core.utils.buscar_projetos_supabase.
    # If the mock is intended for the call inside core/views.py to the utility function,
    # then the path should be 'core.views.buscar_projetos_supabase'.
    # If the mock is intended for the utility function itself (e.g. if views directly called utils.make_supabase_request),
    # it would be @patch('core.utils.make_supabase_request').
    # Given the current structure where views.projetos calls utils.buscar_projetos_supabase,
    # and utils.buscar_projetos_supabase calls utils.make_supabase_request,
    # mocking 'core.views.buscar_projetos_supabase' is correct if we want to isolate the view from the util's direct Supabase call.
    def test_projetos_view_context(self, mock_buscar_projetos):
        # Sample data: one active, one inactive
        mock_data = [
            {"id": 1, "nome": "Active Project", "descricao": "Test", "ativo": True, "techs": ["Python"]},
            {"id": 2, "nome": "Inactive Project", "descricao": "Test", "ativo": False, "techs": ["Django"]},
            {"id": 3, "nome": "Another Active", "descricao": "Test", "ativo": True, "techs": ["JS"]},
        ]
        mock_buscar_projetos.return_value = mock_data

        # Ensure the URL name 'projetos' exists.
        # If it doesn't, this will raise NoReverseMatch, which is a good pre-check.
        try:
            url = reverse('projetos')
        except Exception as e:
            self.fail(f"Could not reverse URL 'projetos'. Check core/urls.py. Error: {e}")
            
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertIn('active_projects', response.context)
        self.assertIn('inactive_projects', response.context)

        active_projects_in_context = response.context['active_projects']
        inactive_projects_in_context = response.context['inactive_projects']

        self.assertEqual(len(active_projects_in_context), 2)
        self.assertEqual(active_projects_in_context[0]['nome'], "Active Project")
        self.assertEqual(active_projects_in_context[1]['nome'], "Another Active")

        self.assertEqual(len(inactive_projects_in_context), 1)
        self.assertEqual(inactive_projects_in_context[0]['nome'], "Inactive Project")
