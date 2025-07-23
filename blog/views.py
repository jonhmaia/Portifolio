from django.shortcuts import render
from datetime import datetime

def articles(request):
    """View para listar todos os artigos do blog"""
    # Dados de exemplo - posteriormente serão vindos do banco de dados
    articles_list = [
        {
            'id': 1,
            'title': 'Introdução ao Django',
            'slug': 'introducao-ao-django',
            'excerpt': 'Aprenda os conceitos básicos do framework Django para desenvolvimento web em Python.',
            'content': 'Django é um framework web de alto nível escrito em Python...',
            'author': 'Seu Nome',
            'published_date': datetime(2024, 1, 15),
            'tags': ['Django', 'Python', 'Web Development'],
            'featured_image': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
            'reading_time': 5
        },
        {
            'id': 2,
            'title': 'CSS Grid vs Flexbox',
            'slug': 'css-grid-vs-flexbox',
            'excerpt': 'Entenda as diferenças entre CSS Grid e Flexbox e quando usar cada um.',
            'content': 'CSS Grid e Flexbox são duas tecnologias poderosas...',
            'author': 'Seu Nome',
            'published_date': datetime(2024, 1, 10),
            'tags': ['CSS', 'Frontend', 'Layout'],
            'featured_image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
            'reading_time': 8
        },
        {
            'id': 3,
            'title': 'Deploy de Aplicações Django',
            'slug': 'deploy-aplicacoes-django',
            'excerpt': 'Guia completo para fazer deploy de aplicações Django em produção.',
            'content': 'Fazer deploy de uma aplicação Django requer alguns cuidados...',
            'author': 'Seu Nome',
            'published_date': datetime(2024, 1, 5),
            'tags': ['Django', 'Deploy', 'DevOps'],
            'featured_image': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
            'reading_time': 12
        }
    ]
    
    context = {
        'page_title': 'Blog',
        'articles': articles_list,
        'recent_articles': articles_list[:3]  # Últimos 3 artigos
    }
    return render(request, 'blog/articles.html', context)

def article_detail(request, slug):
    """View para exibir detalhes de um artigo específico"""
    # Simulação de busca por slug - posteriormente será do banco de dados
    articles_data = {
        'introducao-ao-django': {
            'id': 1,
            'title': 'Introdução ao Django',
            'slug': 'introducao-ao-django',
            'content': '''<h2>O que é Django?</h2>
            <p>Django é um framework web de alto nível escrito em Python que encoraja o desenvolvimento rápido e limpo, com design pragmático.</p>
            
            <h3>Principais características:</h3>
            <ul>
                <li>Rápido desenvolvimento</li>
                <li>Segurança integrada</li>
                <li>Escalável</li>
                <li>Versátil</li>
            </ul>
            
            <h3>Arquitetura MVT</h3>
            <p>Django segue o padrão MVT (Model-View-Template), que é uma variação do padrão MVC.</p>
            
            <h3>Primeiros passos</h3>
            <p>Para começar com Django, você precisa ter Python instalado em seu sistema...</p>''',
            'author': 'Seu Nome',
            'published_date': datetime(2024, 1, 15),
            'tags': ['Django', 'Python', 'Web Development'],
            'featured_image': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80',
            'reading_time': 5
        }
    }
    
    article = articles_data.get(slug)
    if not article:
        # Em um projeto real, retornaria 404
        article = {
            'title': 'Artigo não encontrado',
            'content': 'O artigo solicitado não foi encontrado.',
            'author': 'Sistema',
            'published_date': datetime.now()
        }
    
    context = {
        'page_title': article.get('title', 'Artigo'),
        'article': article
    }
    return render(request, 'blog/article_detail.html', context)
