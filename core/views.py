from django.shortcuts import render, redirect
# from django.utils.translation import activate # Removed
from .models import SobreMim
from .utils import buscar_projetos_supabase, make_supabase_request # Import make_supabase_request
import requests # requests is still used by make_supabase_request, so keep it for now. Will remove if not needed.
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib import messages

# SUPABASE_URL = 'https://zixvekycedfltzsbsjfy.supabase.co' # Deleted
# SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHZla3ljZWRmbHR6c2JzamZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjM4MDAsImV4cCI6MjA1OTY5OTgwMH0.yLb7D3YvNFX_KE9Ldftdl8vsHQzYhCLiQkpwqgKiazI' # Deleted
# SUPABASE_TABLE = 'projetos' # Deleted, and it is not used in this file.


def home(request):
    return render(request, 'home.html')

def sobre_mim(request):
    # # Se não houver cookie de idioma, ativa pt-br manualmente # Removed
    # if 'django_language' not in request.COOKIES: # Removed
    #     activate('pt-br') # Removed

    dados = SobreMim.objects.first()
    return render(request, 'sobre_mim.html', {'dados': dados})


def projetos(request):
    
    lista = buscar_projetos_supabase()
    active_projects = []
    inactive_projects = []
    for projeto in lista:
        if projeto.get('ativo', False): # Use .get for safety
            active_projects.append(projeto)
        else:
            inactive_projects.append(projeto)
    
    context = {
        'active_projects': active_projects,
        'inactive_projects': inactive_projects
    }
    return render(request, 'projetos.html', context)

@login_required
def admin_projetos(request):
    # headers = { # Removed
    #     "apikey": settings.SUPABASE_KEY, # Removed
    #     "Authorization": f"Bearer {settings.SUPABASE_KEY}" # Removed
    # } # Removed

    # response = requests.get(f"{settings.SUPABASE_URL}/rest/v1/projetos?select=*", headers=headers) # Removed
    response = make_supabase_request(method="GET", endpoint="projetos?select=*")

    projetos = response.json() if response.status_code == 200 else []

    return render(request, "admin_projetos.html", {"projetos": projetos})

@login_required
def criar_projeto(request):
    if request.method == "POST":
        nome = request.POST.get("nome")
        descricao = request.POST.get("descricao")
        tipo = request.POST.get("tipo") or ""
        repo_url = request.POST.get("repo_url") or ""
        demo_url = request.POST.get("demo_url") or ""
        techs = request.POST.get("techs").split(",")
        ativo = request.POST.get("ativo") == "on"

        # headers = { # Removed
        #     "apikey": settings.SUPABASE_KEY, # Removed
        #     "Authorization": f"Bearer {settings.SUPABASE_KEY}", # Removed
        #     "Content-Type": "application/json", # Removed
        #     "Prefer": "return=representation" # Removed
        # } # Removed

        payload = {
            "nome": nome,
            "descricao": descricao,
            "Tipo": tipo,
            "repo_url": repo_url,
            "demo_url": demo_url,
            "techs": techs,
            "ativo": ativo
        }

        # response = requests.post( # Removed
        #     f"{settings.SUPABASE_URL}/rest/v1/projetos", # Removed
        #     headers=headers, # Removed
        #     json=payload # Removed
        # ) # Removed
        response = make_supabase_request(method="POST", endpoint="projetos", data=payload)

        # print("DADOS ENVIADOS:", payload) # Removed
        # print("STATUS:", response.status_code) # Removed
        # print("RESPOSTA:", response.text) # Removed

        if response.status_code == 201:
            messages.success(request, "Projeto criado com sucesso!")
        else:
            messages.error(request, f"Erro ao criar projeto: {response.text}")

        return redirect("admin_projetos")

    return render(request, "criar_projeto.html")

@login_required
def excluir_projeto(request, id):
    # headers = { # Removed
    #     "apikey": settings.SUPABASE_KEY, # Removed
    #     "Authorization": f"Bearer {settings.SUPABASE_KEY}", # Removed
    #     "Content-Type": "application/json" # Removed
    # } # Removed

    # response = requests.delete( # Removed
    #     f"{settings.SUPABASE_URL}/rest/v1/projetos?id=eq.{id}", # Removed
    #     headers=headers # Removed
    # ) # Removed
    response = make_supabase_request(method="DELETE", endpoint=f"projetos?id=eq.{id}")

    if response.status_code == 204:
        messages.success(request, "Projeto excluído com sucesso.")
    else:
        messages.error(request, f"Erro ao excluir: {response.text}")

    return redirect("admin_projetos")

@login_required
def editar_projeto(request, id):
    # headers = { # Removed
    #     "apikey": settings.SUPABASE_KEY, # Removed
    #     "Authorization": f"Bearer {settings.SUPABASE_KEY}", # Removed
    #     "Content-Type": "application/json" # Removed
    # } # Removed

    # GET para buscar dados do projeto
    if request.method == "GET":
        # res = requests.get(f"{settings.SUPABASE_URL}/rest/v1/projetos?id=eq.{id}&select=*", headers=headers) # Removed
        res = make_supabase_request(method="GET", endpoint=f"projetos?id=eq.{id}&select=*")
        if res.status_code == 200 and res.json():
            projeto = res.json()[0]
        else:
            messages.error(request, "Projeto não encontrado.")
            return redirect("admin_projetos")
        return render(request, "editar_projeto.html", {"projeto": projeto})

    # PATCH para atualizar
    if request.method == "POST":
        payload = {
            "nome": request.POST.get("nome"),
            "descricao": request.POST.get("descricao"),
            "Tipo": request.POST.get("tipo"),
            "repo_url": request.POST.get("repo_url"),
            "demo_url": request.POST.get("demo_url"),
            "techs": request.POST.get("techs").split(","),
            "ativo": request.POST.get("ativo") == "on"
        }

        # res = requests.patch( # Removed
        #     f"{settings.SUPABASE_URL}/rest/v1/projetos?id=eq.{id}", # Removed
        #     headers=headers, # Removed
        #     json=payload # Removed
        # ) # Removed
        res = make_supabase_request(method="PATCH", endpoint=f"projetos?id=eq.{id}", data=payload)


        if res.status_code in [200, 204]: # 200 for PATCH with Prefer: return=representation
            messages.success(request, "Projeto atualizado com sucesso!")
        else:
            messages.error(request, f"Erro ao atualizar: {res.text}")
        return redirect("admin_projetos")