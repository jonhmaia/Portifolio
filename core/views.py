from django.shortcuts import render, redirect
from django.utils.translation import activate
from .models import SobreMim
from .utils import buscar_projetos_supabase
import requests
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib import messages

SUPABASE_URL = 'https://zixvekycedfltzsbsjfy.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHZla3ljZWRmbHR6c2JzamZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjM4MDAsImV4cCI6MjA1OTY5OTgwMH0.yLb7D3YvNFX_KE9Ldftdl8vsHQzYhCLiQkpwqgKiazI'
SUPABASE_TABLE = 'projetos'



def home(request):
    return render(request, 'home.html')

def sobre_mim(request):
    # Se não houver cookie de idioma, ativa pt-br manualmente
    if 'django_language' not in request.COOKIES:
        activate('pt-br')

    dados = SobreMim.objects.first()
    return render(request, 'sobre_mim.html', {'dados': dados})


def projetos(request):
    
    lista = buscar_projetos_supabase()
    return render(request, 'projetos.html', {'projetos': lista})

@login_required
def admin_projetos(request):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    response = requests.get(f"{SUPABASE_URL}/rest/v1/projetos?select=*", headers=headers)

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

        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

        payload = {
            "nome": nome,
            "descricao": descricao,
            "Tipo": tipo,
            "repo_url": repo_url,
            "demo_url": demo_url,
            "techs": techs,
            "ativo": ativo
        }

        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/projetos",
            headers=headers,
            json=payload
        )

        print("DADOS ENVIADOS:", payload)
        print("STATUS:", response.status_code)
        print("RESPOSTA:", response.text)

        if response.status_code == 201:
            messages.success(request, "Projeto criado com sucesso!")
        else:
            messages.error(request, f"Erro ao criar projeto: {response.text}")

        return redirect("admin_projetos")

    return render(request, "criar_projeto.html")

@login_required
def excluir_projeto(request, id):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.delete(
        f"{SUPABASE_URL}/rest/v1/projetos?id=eq.{id}",
        headers=headers
    )

    if response.status_code == 204:
        messages.success(request, "Projeto excluído com sucesso.")
    else:
        messages.error(request, f"Erro ao excluir: {response.text}")

    return redirect("admin_projetos")

@login_required
def editar_projeto(request, id):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    # GET para buscar dados do projeto
    if request.method == "GET":
        res = requests.get(f"{SUPABASE_URL}/rest/v1/projetos?id=eq.{id}&select=*", headers=headers)
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

        res = requests.patch(
            f"{SUPABASE_URL}/rest/v1/projetos?id=eq.{id}",
            headers=headers,
            json=payload
        )

        if res.status_code in [200, 204]:
            messages.success(request, "Projeto atualizado com sucesso!")
        else:
            messages.error(request, f"Erro ao atualizar: {res.text}")
        return redirect("admin_projetos")