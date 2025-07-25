from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse
from django.conf import settings
import gzip
import io

class SEOMiddleware(MiddlewareMixin):
    """
    Middleware para otimizações de SEO e performance
    """
    
    def process_request(self, request):
        """
        Processa a requisição para otimizações de SEO
        """
        # Pula processamento para arquivos estáticos
        if request.path.startswith('/static/') or request.path.startswith('/media/'):
            return None
            
        # Adiciona headers de segurança
        request.META['HTTP_X_FRAME_OPTIONS'] = 'DENY'
        request.META['HTTP_X_CONTENT_TYPE_OPTIONS'] = 'nosniff'
        request.META['HTTP_X_XSS_PROTECTION'] = '1; mode=block'
        
        # Força HTTPS em produção
        if not settings.DEBUG and not request.is_secure():
            if request.META.get('HTTP_X_FORWARDED_PROTO') != 'https':
                return HttpResponse(
                    'HTTPS required',
                    status=301,
                    headers={'Location': f'https://{request.get_host()}{request.get_full_path()}'}
                )
    
    def process_response(self, request, response):
        """
        Processa a resposta para otimizações de performance
        """
        # Pula processamento para arquivos estáticos
        if request.path.startswith('/static/') or request.path.startswith('/media/'):
            return response
            
        # Adiciona headers de cache para recursos estáticos
        if request.path.startswith('/static/'):
            response['Cache-Control'] = 'public, max-age=31536000, immutable'
            response['Expires'] = 'Thu, 31 Dec 2037 23:55:55 GMT'
        
        # Adiciona headers de segurança
        response['X-Frame-Options'] = 'DENY'
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # Content Security Policy
        if not settings.DEBUG:
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' "
                "https://cdn.jsdelivr.net https://cdnjs.cloudflare.com "
                "https://www.googletagmanager.com https://www.google-analytics.com; "
                "style-src 'self' 'unsafe-inline' "
                "https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: https:; "
                "connect-src 'self' https://www.google-analytics.com; "
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self';"
            )
            response['Content-Security-Policy'] = csp
        
        # Compressão GZIP para HTML, CSS, JS
        if (response.get('Content-Type', '').startswith(('text/', 'application/json', 'application/javascript')) 
            and 'gzip' in request.META.get('HTTP_ACCEPT_ENCODING', '') 
            and len(response.content) > 200):
            
            # Comprime o conteúdo
            compressed_content = self._compress_content(response.content)
            if compressed_content:
                response.content = compressed_content
                response['Content-Encoding'] = 'gzip'
                response['Content-Length'] = str(len(response.content))
        
        # Headers para PWA
        if request.path == '/':
            response['Link'] = '</static/manifest.json>; rel=manifest'
        
        return response
    
    def _compress_content(self, content):
        """
        Comprime o conteúdo usando GZIP
        """
        try:
            buffer = io.BytesIO()
            with gzip.GzipFile(fileobj=buffer, mode='wb') as f:
                f.write(content)
            return buffer.getvalue()
        except Exception:
            return None

class CanonicalURLMiddleware(MiddlewareMixin):
    """
    Middleware para garantir URLs canônicas
    """
    
    def process_request(self, request):
        """
        Redireciona para URL canônica se necessário
        """
        # Pula URLs específicas do Django que podem causar loops
        skip_paths = ['/set_language', '/admin/', '/static/', '/media/', '/i18n/', '/sitemap.xml', '/robots.txt']
        
        # Pula URLs com prefixos de idioma do Django i18n
        language_prefixes = ['/en/', '/pt-br/']
        if any(request.path.startswith(prefix) for prefix in language_prefixes):
            return None
            
        if any(request.path.startswith(path) for path in skip_paths):
            return None
        
        # Pula URLs que fazem parte do sistema de roteamento do Django i18n
        # Essas URLs são tratadas pelo LocaleMiddleware e podem causar loops
        django_i18n_paths = ['/portfolio', '/blog', '/curriculum', '/dashboard']
        if any(request.path.startswith(path) for path in django_i18n_paths):
            return None
            
        # Força lowercase em URLs (apenas se não for uma URL de app do Django)
        if request.path != request.path.lower():
            query_string = request.META.get('QUERY_STRING', '')
            redirect_url = request.path.lower()
            if query_string:
                redirect_url += f'?{query_string}'
            return HttpResponse(
                status=301,
                headers={'Location': redirect_url}
            )

class PreloadMiddleware(MiddlewareMixin):
    """
    Middleware para adicionar preload hints
    """
    
    def process_response(self, request, response):
        """
        Adiciona preload hints para recursos críticos
        """
        if response.get('Content-Type', '').startswith('text/html'):
            preload_links = [
                '</static/css/seo-optimizations.css>; rel=preload; as=style',
                '</static/js/seo-performance.js>; rel=preload; as=script',
                '</static/images/profile.jpg>; rel=preload; as=image',
            ]
            
            existing_link = response.get('Link', '')
            all_links = [existing_link] + preload_links if existing_link else preload_links
            response['Link'] = ', '.join(all_links)
        
        return response