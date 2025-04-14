import requests

SUPABASE_URL = 'https://zixvekycedfltzsbsjfy.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHZla3ljZWRmbHR6c2JzamZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjM4MDAsImV4cCI6MjA1OTY5OTgwMH0.yLb7D3YvNFX_KE9Ldftdl8vsHQzYhCLiQkpwqgKiazI'
SUPABASE_TABLE = 'projetos'

novos_projetos = [{
    'nome': 'Jogo Aianá', 
    'descricao': 'Aianá é um jogo de aventura RPG com camera top-down e uma arte cativante no estilo pixel art. Nessa aventura você vai experenciar o combate em tempo real em curta e longa distância, explorar o mapa e encontrar inimigos desafiadores, derrotar os chefes e melhorar seu personagem. Tudo isso enquanto conhece um pouco mais sobre a história desse mundo.', 
    'repo_url': 'https://github.com/jonhmaia/', 
    'demo_url': 'https://ossemflorestas.itch.io/', 
    'techs': ['Godot', 'Pixel art', 'Jogos'], 'ativo': True},]
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

response = requests.post(
    f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}",
    headers=headers,
    json=novos_projetos
)

print(response.status_code)
print(response.json())