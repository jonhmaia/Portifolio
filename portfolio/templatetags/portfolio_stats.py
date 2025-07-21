from django import template
from portfolio.models import Projeto, Tecnologia, ImagemProjeto

register = template.Library()

@register.simple_tag
def get_active_projects_count():
    """Retorna o número de projetos ativos"""
    return Projeto.objects.filter(ativo=True).count()

@register.simple_tag
def get_featured_projects_count():
    """Retorna o número de projetos em destaque"""
    return Projeto.objects.filter(destaque=True, ativo=True).count()

@register.simple_tag
def get_technologies_count():
    """Retorna o número total de tecnologias ativas"""
    return Tecnologia.objects.filter(ativo=True).count()

@register.simple_tag
def get_images_count():
    """Retorna o número total de imagens"""
    return ImagemProjeto.objects.count()

@register.simple_tag
def get_recent_projects():
    """Retorna os 5 projetos mais recentes"""
    return Projeto.objects.select_related().prefetch_related('tecnologias').order_by('-data_criacao')[:5]

@register.simple_tag
def get_total_projects_count():
    """Retorna o número total de projetos"""
    return Projeto.objects.count()

@register.simple_tag
def get_inactive_projects_count():
    """Retorna o número de projetos inativos"""
    return Projeto.objects.filter(ativo=False).count()

@register.simple_tag
def get_projects_by_status():
    """Retorna estatísticas de projetos por status"""
    return {
        'total': Projeto.objects.count(),
        'active': Projeto.objects.filter(ativo=True).count(),
        'inactive': Projeto.objects.filter(ativo=False).count(),
        'featured': Projeto.objects.filter(destaque=True, ativo=True).count(),
    }

@register.simple_tag
def get_top_technologies():
    """Retorna as tecnologias mais utilizadas"""
    from django.db.models import Count
    return Tecnologia.objects.annotate(
        projeto_count=Count('projeto')
    ).filter(
        ativo=True,
        projeto_count__gt=0
    ).order_by('-projeto_count')[:5]

@register.inclusion_tag('admin/widgets/project_stats.html')
def show_project_stats():
    """Widget para mostrar estatísticas de projetos"""
    stats = get_projects_by_status()
    return {'stats': stats}

@register.inclusion_tag('admin/widgets/recent_activity.html')
def show_recent_activity():
    """Widget para mostrar atividade recente"""
    recent_projects = get_recent_projects()
    return {'recent_projects': recent_projects}