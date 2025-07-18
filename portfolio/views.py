from django.shortcuts import render

def projects(request):
    """View para listar todos os projetos"""
    # Dados de exemplo - posteriormente serão vindos do banco de dados
    projects_list = [
        {
            'id': 1,
            'title': 'Sistema de Gestão',
            'description': 'Sistema completo de gestão empresarial desenvolvido em Django.',
            'technologies': ['Django', 'PostgreSQL', 'Bootstrap'],
            'image': 'https://via.placeholder.com/400x250',
            'github_url': 'https://github.com/usuario/projeto1',
            'demo_url': 'https://projeto1.exemplo.com',
            'featured': True
        },
        {
            'id': 2,
            'title': 'E-commerce',
            'description': 'Plataforma de e-commerce com carrinho de compras e pagamento online.',
            'technologies': ['Django', 'React', 'Stripe'],
            'image': 'https://via.placeholder.com/400x250',
            'github_url': 'https://github.com/usuario/projeto2',
            'demo_url': 'https://projeto2.exemplo.com',
            'featured': False
        },
        {
            'id': 3,
            'title': 'API REST',
            'description': 'API REST completa com autenticação JWT e documentação.',
            'technologies': ['Django REST Framework', 'JWT', 'Swagger'],
            'image': 'https://via.placeholder.com/400x250',
            'github_url': 'https://github.com/usuario/projeto3',
            'demo_url': None,
            'featured': True
        }
    ]
    
    context = {
        'page_title': 'Projetos',
        'projects': projects_list,
        'featured_projects': [p for p in projects_list if p['featured']]
    }
    return render(request, 'portfolio/projects.html', context)

def project_detail(request, project_id):
    """View para exibir detalhes de um projeto específico"""
    # Simulação de busca por ID - posteriormente será do banco de dados
    projects_data = {
        1: {
            'id': 1,
            'title': 'Sistema de Gestão',
            'description': 'Sistema completo de gestão empresarial desenvolvido em Django.',
            'long_description': 'Este projeto foi desenvolvido para automatizar processos empresariais, incluindo gestão de clientes, vendas, estoque e relatórios. Utiliza Django como framework principal, PostgreSQL como banco de dados e Bootstrap para o frontend.',
            'technologies': ['Django', 'PostgreSQL', 'Bootstrap', 'JavaScript'],
            'image': 'https://via.placeholder.com/800x400',
            'github_url': 'https://github.com/usuario/projeto1',
            'demo_url': 'https://projeto1.exemplo.com',
            'features': [
                'Gestão de clientes e fornecedores',
                'Controle de estoque',
                'Sistema de vendas',
                'Relatórios gerenciais',
                'Dashboard interativo'
            ]
        }
    }
    
    project = projects_data.get(project_id)
    if not project:
        # Em um projeto real, retornaria 404
        project = {
            'title': 'Projeto não encontrado',
            'description': 'O projeto solicitado não foi encontrado.'
        }
    
    context = {
        'page_title': project.get('title', 'Projeto'),
        'project': project
    }
    return render(request, 'portfolio/project_detail.html', context)
