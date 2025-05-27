import requests
from django.conf import settings

def buscar_projetos_supabase():
    url = f"{settings.SUPABASE_URL}/rest/v1/{settings.SUPABASE_TABLE}"
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_KEY}",
    }
    response = requests.get(url, headers=headers, params={"select": "*"})
    if response.status_code == 200:
        return response.json()
    return []

def make_supabase_request(method: str, endpoint: str, data: dict = None, params: dict = None) -> requests.Response:
    """
    Helper function to make requests to Supabase API.
    """
    full_url = f"{settings.SUPABASE_URL}/rest/v1/{endpoint}"
    
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_KEY}",
    }

    if data:  # For POST/PATCH requests that send JSON
        headers["Content-Type"] = "application/json"
        headers["Prefer"] = "return=representation"  # Often useful for POST/PATCH

    response = requests.request(method, full_url, headers=headers, json=data, params=params)
    return response
