from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.contrib import messages
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse
from .models import Projeto, Tecnologia
from .forms import ProjetoAdminForm
from core.seo import get_seo_context

# Função para verificar se o usuário é superusuário
def is_superuser(user):
    return user.is_authenticated and user.is_superuser

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
        'seo': get_seo_context('projects'),
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
        'seo': get_seo_context(obj=project),
    }
    return render(request, 'portfolio/project_detail.html', context)

# Views para gestão de projetos
@user_passes_test(is_superuser, login_url='/login/')
def manage_projects(request):
    """View para listar e gerenciar projetos"""
    projects_list = Projeto.objects.all().prefetch_related('tecnologias').order_by('-data_criacao')
    
    # Filtro por status
    status_filter = request.GET.get('status')
    if status_filter:
        projects_list = projects_list.filter(status=status_filter)
    
    # Busca por título
    search = request.GET.get('search')
    if search:
        projects_list = projects_list.filter(titulo__icontains=search)
    
    context = {
        'page_title': 'Gerenciar Projetos',
        'projects': projects_list,
        'status_choices': Projeto._meta.get_field('status').choices,
        'current_status_filter': status_filter,
        'current_search': search,
    }
    return render(request, 'portfolio/manage_projects.html', context)

@user_passes_test(is_superuser, login_url='/login/')
def create_project(request):
    """View para criar novo projeto"""
    if request.method == 'POST':
        form = ProjetoAdminForm(request.POST, request.FILES)
        if form.is_valid():
            project = form.save()
            messages.success(request, f'Projeto "{project.titulo}" criado com sucesso!')
            return redirect('portfolio:manage_projects')
        else:
            messages.error(request, 'Erro ao criar projeto. Verifique os dados informados.')
    else:
        form = ProjetoAdminForm()
    
    context = {
        'page_title': 'Criar Novo Projeto',
        'form': form,
        'action': 'create'
    }
    return render(request, 'portfolio/project_form.html', context)

@user_passes_test(is_superuser, login_url='/login/')
def edit_project(request, project_id):
    """View para editar projeto existente"""
    project = get_object_or_404(Projeto, id=project_id)
    
    if request.method == 'POST':
        form = ProjetoAdminForm(request.POST, request.FILES, instance=project)
        if form.is_valid():
            project = form.save()
            messages.success(request, f'Projeto "{project.titulo}" atualizado com sucesso!')
            return redirect('portfolio:manage_projects')
        else:
            messages.error(request, 'Erro ao atualizar projeto. Verifique os dados informados.')
    else:
        form = ProjetoAdminForm(instance=project)
    
    context = {
        'page_title': f'Editar: {project.titulo}',
        'form': form,
        'project': project,
        'action': 'edit'
    }
    return render(request, 'portfolio/project_form.html', context)

@user_passes_test(is_superuser, login_url='/login/')
def delete_project(request, project_id):
    """View para excluir projeto"""
    if request.method == 'POST':
        project = get_object_or_404(Projeto, id=project_id)
        titulo = project.titulo
        project.delete()
        messages.success(request, f'Projeto "{titulo}" excluído com sucesso!')
        return JsonResponse({'success': True})
    
    return JsonResponse({'success': False, 'error': 'Método não permitido'})

# Views de autenticação removidas - usando login unificado
