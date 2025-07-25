from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import user_passes_test
from django.contrib import messages
from datetime import datetime
from .models import Artigo
from .forms import ArtigoForm
from core.seo import get_seo_context

# Função para verificar se o usuário é superusuário
def is_superuser(user):
    return user.is_authenticated and user.is_superuser

# Views de autenticação removidas - usando login unificado

def articles(request):
    """View para listar todos os artigos do blog"""
    # Buscar apenas artigos publicados
    artigos_publicados = Artigo.objects.filter(status='publicado').order_by('-data_publicacao')
    
    context = {
        'page_title': 'Blog',
        'articles': artigos_publicados,
        'recent_articles': artigos_publicados[:3],  # Últimos 3 artigos
        'seo': get_seo_context('blog'),
    }
    return render(request, 'blog/articles.html', context)

def article_detail(request, slug):
    """View para exibir detalhes de um artigo específico"""
    try:
        # Buscar artigo publicado pelo slug
        artigo = Artigo.objects.get(slug=slug, status='publicado')
        
        # Incrementar visualizações
        artigo.visualizacoes = (artigo.visualizacoes or 0) + 1
        artigo.save(update_fields=['visualizacoes'])
        
        context = {
            'page_title': artigo.titulo,
            'article': artigo,
            'seo': get_seo_context(obj=artigo),
        }
        
    except Artigo.DoesNotExist:
        context = {
            'page_title': 'Artigo não encontrado',
            'article': None
        }
    
    return render(request, 'blog/article_detail.html', context)

# Views de gerenciamento de artigos (protegidas)
@user_passes_test(is_superuser, login_url='/login/')
def manage_articles(request):
    """View para gerenciar artigos do blog"""
    artigos = Artigo.objects.all().order_by('-data_publicacao')
    
    context = {
        'page_title': 'Gerenciar Artigos',
        'artigos': artigos
    }
    return render(request, 'blog/manage_articles.html', context)

@user_passes_test(is_superuser, login_url='/login/')
def create_article(request):
    """View para criar novo artigo"""
    if request.method == 'POST':
        form = ArtigoForm(request.POST, request.FILES)
        if form.is_valid():
            artigo = form.save(commit=False)
            artigo.autor = request.user
            artigo.save()
            messages.success(request, 'Artigo criado com sucesso!')
            return redirect('blog:manage_articles')
    else:
        form = ArtigoForm()
    
    context = {
        'page_title': 'Criar Artigo',
        'form': form,
        'action': 'create'
    }
    return render(request, 'blog/article_form.html', context)

@user_passes_test(is_superuser, login_url='/login/')
def edit_article(request, pk):
    """View para editar artigo existente"""
    artigo = get_object_or_404(Artigo, pk=pk)
    
    if request.method == 'POST':
        form = ArtigoForm(request.POST, request.FILES, instance=artigo)
        if form.is_valid():
            form.save()
            messages.success(request, 'Artigo atualizado com sucesso!')
            return redirect('blog:manage_articles')
    else:
        form = ArtigoForm(instance=artigo)
    
    context = {
        'page_title': 'Editar Artigo',
        'form': form,
        'artigo': artigo,
        'action': 'edit'
    }
    return render(request, 'blog/article_form.html', context)

@user_passes_test(is_superuser, login_url='/login/')
def delete_article(request, pk):
    """View para deletar artigo"""
    artigo = get_object_or_404(Artigo, pk=pk)
    
    if request.method == 'POST':
        artigo.delete()
        messages.success(request, 'Artigo deletado com sucesso!')
        return redirect('blog:manage_articles')
    
    context = {
        'page_title': 'Deletar Artigo',
        'artigo': artigo
    }
    return render(request, 'blog/delete_article.html', context)
