from django.shortcuts import render

def home(request):
    """View para a página inicial do portfólio"""
    context = {
        'page_title': 'Home',
        'welcome_message': 'Bem-vindo ao meu portfólio!',
        'description': 'Desenvolvedor apaixonado por tecnologia e inovação.'
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
