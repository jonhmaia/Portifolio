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
