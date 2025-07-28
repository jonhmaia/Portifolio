from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from django.utils import timezone
from portfolio.models import Projeto
from blog.models import Artigo


class StaticViewSitemap(Sitemap):
    """Sitemap para páginas estáticas"""
    priority = 0.8
    changefreq = 'weekly'
    protocol = 'https'

    def items(self):
        return ['core:home', 'portfolio:projects', 'blog:articles', 'core:curriculum']

    def location(self, item):
        return reverse(item)

    def lastmod(self, item):
        return timezone.now()


class ProjectSitemap(Sitemap):
    """Sitemap para projetos"""
    changefreq = 'monthly'
    priority = 0.6
    protocol = 'https'

    def items(self):
        return Projeto.objects.filter(ativo=True).order_by('-data_criacao')

    def lastmod(self, obj):
        return obj.data_atualizacao

    def location(self, obj):
        return reverse('portfolio:project_detail', args=[obj.id])


class ArticleSitemap(Sitemap):
    """Sitemap para artigos do blog"""
    changefreq = 'monthly'
    priority = 0.5
    protocol = 'https'

    def items(self):
        return Artigo.objects.filter(status='publicado').order_by('-data_publicacao')

    def lastmod(self, obj):
        return obj.data_atualizacao

    def location(self, obj):
        return reverse('blog:article_detail', args=[obj.slug])