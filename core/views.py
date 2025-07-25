from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from portfolio.models import Projeto

def is_superuser(user):
    """Verifica se o usuário é superusuário"""
    return user.is_authenticated and user.is_superuser

def home(request):
    """View para a página inicial do portfólio"""
    # Buscar projetos em destaque (ativos e marcados como destaque)
    featured_projects = Projeto.objects.filter(ativo=True, destaque=True).prefetch_related('tecnologias').order_by('ordem', '-data_criacao')
    
    context = {
        'page_title': 'Home',
        'welcome_message': 'Bem-vindo ao meu portfólio!',
        'description': 'Desenvolvedor apaixonado por tecnologia e inovação.',
        'recent_projects': featured_projects,
    }
    return render(request, 'core/home.html', context)

def curriculum(request):
    """View para a página de currículo"""
    context = {
        'page_title': 'Currículo',
        'personal_info': {
            'name': 'Seu Nome',
            'title': 'Desenvolvedor Full Stack',
            'email': 'seu.email@exemplo.com',
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
                'position': 'Desenvolvedor Full Stack',
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
        ]
    }
    return render(request, 'core/curriculum.html', context)

@user_passes_test(is_superuser, login_url='/login/')
def dashboard(request):
    """View para o painel de controle administrativo"""
    context = {
        'page_title': 'Painel de Controle',
        'user': request.user,
    }
    return render(request, 'dashboard.html', context)
