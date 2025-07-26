"""
URL configuration for meu_portfolio project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns
from django.views.i18n import set_language
from django.contrib.sitemaps.views import sitemap
from django.views.generic import TemplateView
from django.http import HttpResponse
from core.sitemaps import StaticViewSitemap, ProjectSitemap, ArticleSitemap
import logging

logger = logging.getLogger(__name__)

# Configuração dos sitemaps
sitemaps = {
    'static': StaticViewSitemap,
    'projects': ProjectSitemap,
    'articles': ArticleSitemap,
}

# Função para servir robots.txt
def robots_txt(request):
    lines = [
        "User-agent: *",
        "Allow: /",
        "",
        "# Sitemap",
        f"Sitemap: {request.scheme}://{request.get_host()}/sitemap.xml",
        "",
        "# Disallow admin and private areas",
        "Disallow: /admin/",
        "Disallow: /dashboard/",
        "Disallow: /login/",
        "Disallow: /logout/",
        "",
        "# Allow important pages",
        "Allow: /",
        "Allow: /portfolio/",
        "Allow: /blog/",
        "Allow: /curriculum/",
        "Allow: /static/",
        "Allow: /media/",
        "",
        "# Crawl delay",
        "Crawl-delay: 1",
        "",
        "# Specific rules for different bots",
        "User-agent: Googlebot",
        "Allow: /",
        "Crawl-delay: 0",
        "",
        "User-agent: Bingbot",
        "Allow: /",
        "Crawl-delay: 1",
        "",
        "User-agent: facebookexternalhit",
        "Allow: /",
        "",
        "User-agent: Twitterbot",
        "Allow: /",
        "",
        "User-agent: LinkedInBot",
        "Allow: /",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('set_language/', set_language, name='set_language'),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', robots_txt, name='robots_txt'),
]

urlpatterns += i18n_patterns(
    path('', include('core.urls')),
    path('portfolio/', include('portfolio.urls')),
    path('blog/', include('blog.urls')),
    prefix_default_language=False,
)

# Servir arquivos de media em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
