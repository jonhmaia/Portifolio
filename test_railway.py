#!/usr/bin/env python
"""
Script de teste para verificar se a aplicação está funcionando corretamente
antes do deploy no Railway.
"""

import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meu_portfolio.settings')
    os.environ.setdefault('RAILWAY_ENVIRONMENT', 'production')  # Simula Railway
    
    django.setup()
    
    # Teste básico de importações
    try:
        from core.views import home
        from portfolio.models import Projeto
        from blog.models import Artigo
        from core.sitemaps import StaticViewSitemap, ProjectSitemap, ArticleSitemap
        print("✅ Todas as importações estão funcionando")
    except Exception as e:
        print(f"❌ Erro nas importações: {e}")
        sys.exit(1)
    
    # Teste de configurações
    print(f"DEBUG: {settings.DEBUG}")
    print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
    print(f"SECRET_KEY definida: {'Sim' if settings.SECRET_KEY else 'Não'}")
    
    # Teste de sitemaps
    try:
        static_sitemap = StaticViewSitemap()
        static_items = static_sitemap.items()
        print(f"✅ Sitemap estático: {len(static_items)} itens")
        
        project_sitemap = ProjectSitemap()
        project_items = project_sitemap.items()
        print(f"✅ Sitemap projetos: {len(project_items)} itens")
        
        article_sitemap = ArticleSitemap()
        article_items = article_sitemap.items()
        print(f"✅ Sitemap artigos: {len(article_items)} itens")
        
    except Exception as e:
        print(f"❌ Erro nos sitemaps: {e}")
        sys.exit(1)
    
    print("\n🎉 Todos os testes passaram! A aplicação deve funcionar no Railway.")