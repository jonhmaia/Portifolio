from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseBadRequest
from django.conf import settings
from portfolio.models import Projeto
from .seo import get_seo_context
import os
import mimetypes

def is_superuser(user):
    """Verifica se o usuário é superusuário"""
    return user.is_authenticated and user.is_superuser

def home(request):
    """View para a página inicial do portfólio"""
    # Buscar projetos em destaque (ativos e marcados como destaque)
    featured_projects = Projeto.objects.filter(ativo=True, destaque=True).prefetch_related('tecnologias', 'imagens').order_by('ordem', '-data_criacao')
    
    context = {
        'page_title': 'Home',
        'welcome_message': 'Bem-vindo ao meu portfólio!',
        'description': 'Desenvolvedor apaixonado por tecnologia e inovação.',
        'recent_projects': featured_projects,
        'seo': get_seo_context('home'),
    }
    return render(request, 'core/home.html', context)

def curriculum(request):
    """View para a página de currículo"""
    context = {
        'page_title': 'Currículo',
        'personal_info': {
            'name': 'João Marcos Maia',
            'title': 'Engenheiro de Software',
            'email': 'joao@exemplo.com',
            'phone': '(11) 99999-9999',
            'location': 'São Paulo, SP'
        },
        'skills': [
            'Python', 'Django', 'JavaScript', 'React', 'HTML/CSS',
            'PostgreSQL', 'Git', 'Docker', 'AWS'
        ],
        'experience': [
            {
                'company': 'Empresa XYZ',
                'position': 'Engenheiro de Software',
                'period': '2022 - Presente',
                'description': 'Desenvolvimento de aplicações web usando Django e React.'
            }
        ],
        'education': [
            {
                'institution': 'Universidade ABC',
                'degree': 'Bacharelado em Ciência da Computação',
                'period': '2018 - 2022'
            }
        ],
        'seo': get_seo_context('curriculum'),
    }
    return render(request, 'core/curriculum.html', context)

@user_passes_test(is_superuser, login_url='/login/')
def dashboard(request):
    """View para o painel de controle administrativo"""
    context = {
        'page_title': 'Painel de Controle',
        'user': request.user,
        'seo': get_seo_context('dashboard'),
    }
    return render(request, 'dashboard.html', context)

def serve_media(request, file_path):
    """
    View para servir arquivos de mídia em produção.
    Esta view é necessária porque o WhiteNoise não serve arquivos de mídia.
    """
    # Verificar se MEDIA_ROOT está configurado
    media_root = getattr(settings, 'MEDIA_ROOT', None)
    if not media_root:
        return HttpResponseBadRequest('MEDIA_ROOT não configurado')
    
    # Verificar se o caminho do arquivo foi fornecido
    if not file_path:
        return HttpResponseBadRequest('Caminho do arquivo inválido')
    
    # Construir o caminho completo do arquivo
    full_path = os.path.join(media_root, file_path)
    
    # Verificar se o arquivo existe e está dentro do MEDIA_ROOT (segurança)
    if not os.path.exists(full_path) or not os.path.commonpath([media_root, full_path]) == str(media_root):
        return HttpResponseNotFound('Arquivo não encontrado')
    
    try:
        # Determinar o tipo MIME do arquivo
        content_type, _ = mimetypes.guess_type(full_path)
        if content_type is None:
            content_type = 'application/octet-stream'
        
        # Ler e retornar o arquivo
        with open(full_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type=content_type)
            response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
            return response
    except IOError:
        return HttpResponseNotFound('Erro ao ler o arquivo')
