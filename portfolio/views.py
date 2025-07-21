from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from .models import Projeto, Tecnologia

def projects(request):
    """View para listar todos os projetos"""
    # Buscar projetos ativos ordenados por destaque e ordem
    projects_list = Projeto.objects.filter(ativo=True).prefetch_related('tecnologias', 'imagens')
    
    # Filtro por tecnologia se especificado
    tech_filter = request.GET.get('tech')
    if tech_filter:
        projects_list = projects_list.filter(tecnologias__nome__icontains=tech_filter)
    
    # Filtro por status se especificado
    status_filter = request.GET.get('status')
    if status_filter:
        projects_list = projects_list.filter(status=status_filter)
    
    # Paginação
    paginator = Paginator(projects_list, 6)  # 6 projetos por página
    page_number = request.GET.get('page')
    projects = paginator.get_page(page_number)
    
    # Projetos em destaque
    featured_projects = Projeto.objects.filter(ativo=True, destaque=True).prefetch_related('tecnologias')[:3]
    
    # Todas as tecnologias para filtros
    all_technologies = Tecnologia.objects.filter(ativo=True).order_by('categoria', 'nome')
    
    context = {
        'page_title': 'Projetos',
        'projects': projects,
        'featured_projects': featured_projects,
        'all_technologies': all_technologies,
        'current_tech_filter': tech_filter,
        'current_status_filter': status_filter,
        'status_choices': Projeto._meta.get_field('status').choices,
    }
    return render(request, 'portfolio/projects.html', context)

def project_detail(request, project_id):
    """View para exibir detalhes de um projeto específico"""
    project = get_object_or_404(
        Projeto.objects.prefetch_related('tecnologias', 'imagens'), 
        id=project_id, 
        ativo=True
    )
    
    # Projetos relacionados (mesmas tecnologias, excluindo o atual)
    related_projects = Projeto.objects.filter(
        ativo=True,
        tecnologias__in=project.tecnologias.all()
    ).exclude(id=project.id).distinct()[:3]
    
    context = {
        'page_title': project.titulo,
        'project': project,
        'related_projects': related_projects,
    }
    return render(request, 'portfolio/project_detail.html', context)
