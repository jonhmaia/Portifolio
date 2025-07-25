# 📋 Documentação Técnica - Portfólio Django

## 🏗️ Arquitetura Detalhada

### Estrutura de Apps

#### 🏠 Core App
```python
core/
├── __init__.py
├── admin.py          # Configurações admin básicas
├── apps.py           # Configuração do app
├── auth_views.py     # Views de autenticação customizadas
├── models.py         # Models básicos (se houver)
├── tests.py          # Testes unitários
├── urls.py           # URLs do core
├── views.py          # Views principais (home, currículo)
└── migrations/       # Migrações do banco
```

**Responsabilidades:**
- Páginas estáticas (home, sobre, currículo)
- Sistema de autenticação customizado
- Context processors globais
- Views base para outros apps

#### 💼 Portfolio App
```python
portfolio/
├── __init__.py
├── admin.py          # Admin customizado para projetos
├── apps.py           # Configuração do app
├── forms.py          # Forms para admin e frontend
├── models.py         # Models: Projeto, Tecnologia, ImagemProjeto
├── tests.py          # Testes do portfolio
├── urls.py           # URLs do portfolio
├── views.py          # Views CRUD para projetos
├── migrations/       # Migrações do banco
├── management/       # Comandos customizados
│   └── commands/
│       └── criar_projetos_exemplo.py
├── templates/        # Templates específicos
│   └── portfolio/
├── templatetags/     # Template tags customizadas
│   ├── __init__.py
│   └── portfolio_stats.py
```

**Models Principais:**

```python
# Modelo Projeto
class Projeto(models.Model):
    titulo = models.CharField(max_length=100)
    subtitulo = models.CharField(max_length=150, blank=True)
    descricao_curta = models.TextField(max_length=300)
    descricao_completa = models.TextField()
    imagem_principal = models.ImageField(upload_to='projetos/')
    tecnologias = models.ManyToManyField('Tecnologia')
    link_repositorio = models.URLField(blank=True)
    link_deploy = models.URLField(blank=True)
    destaque = models.BooleanField(default=False)
    ordem = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

# Modelo Tecnologia
class Tecnologia(models.Model):
    nome = models.CharField(max_length=50, unique=True)
    icone = models.CharField(max_length=100, blank=True)
    cor = models.CharField(max_length=7, default='#000000')
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES)
    ativo = models.BooleanField(default=True)

# Modelo ImagemProjeto
class ImagemProjeto(models.Model):
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE)
    imagem = models.ImageField(upload_to='projetos/galeria/')
    legenda = models.CharField(max_length=200, blank=True)
    ordem = models.PositiveIntegerField(default=0)
```

#### 📝 Blog App
```python
blog/
├── __init__.py
├── admin.py          # Admin para artigos
├── apps.py           # Configuração do app
├── forms.py          # Forms para criação/edição
├── models.py         # Model: Artigo
├── tests.py          # Testes do blog
├── urls.py           # URLs do blog
├── views.py          # Views CRUD para artigos
├── migrations/       # Migrações do banco
└── templates/        # Templates do blog
    └── blog/
```

**Model Principal:**

```python
class Artigo(models.Model):
    titulo = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    conteudo = models.TextField()
    imagem_destaque = models.ImageField(upload_to='blog/', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_publicacao = models.DateTimeField(blank=True, null=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
```

#### 🎨 Jedi App
```python
jedi/
├── __init__.py
├── apps.py           # Configuração do app
├── static/           # CSS compilado
│   └── css/
├── static_src/       # Fonte do Tailwind
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   └── input.css
│   └── static/
│       └── css/
└── templates/        # Templates base
    └── base.html
```

**Responsabilidades:**
- Compilação do Tailwind CSS
- Configuração PostCSS
- Templates base do projeto
- Scripts npm para desenvolvimento

## 🔧 Configurações Django

### Settings.py Principais

```python
# Apps instalados
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Apps locais
    'core',
    'portfolio',
    'blog',
    'jedi',
    
    # Apps terceiros
    'tailwind',
]

# Internacionalização
LANGUAGE_CODE = 'pt-br'
LANGUAGES = [
    ('pt-br', 'Português'),
    ('en', 'English'),
]
USE_I18N = True
USE_L10N = True
LOCALE_PATHS = [BASE_DIR / 'locale']

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # i18n
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URLs
ROOT_URLCONF = 'meu_portfolio.urls'

# Banco de dados
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR}/db.sqlite3',
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Arquivos estáticos
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    BASE_DIR / 'jedi' / 'static',
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Tailwind
TAILWIND_APP_NAME = 'jedi'
INTERNAL_IPS = ['127.0.0.1']
```

### URLs Principais

```python
# meu_portfolio/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('i18n/', include('django.conf.urls.i18n')),
]

# URLs com internacionalização
urlpatterns += i18n_patterns(
    path('', include('core.urls')),
    path('portfolio/', include('portfolio.urls')),
    path('blog/', include('blog.urls')),
    prefix_default_language=False
)

# Arquivos de media em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## 🎨 Frontend - Tailwind CSS

### Configuração Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: [
    '../templates/**/*.html',
    '../**/templates/**/*.html',
    '../**/*.py',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        jedi: {
          "primary": "#3b82f6",
          "secondary": "#8b5cf6",
          "accent": "#06b6d4",
          "neutral": "#1f2937",
          "base-100": "#ffffff",
        },
      },
    ],
  },
}
```

### Scripts NPM

```json
{
  "scripts": {
    "dev": "tailwindcss -i ./src/input.css -o ./static/css/style.css --watch",
    "build": "tailwindcss -i ./src/input.css -o ./static/css/style.css --minify"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/typography": "^0.5.10",
    "autoprefixer": "^10.4.16",
    "daisyui": "^4.4.19",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6"
  }
}
```

## 🌐 Sistema de Internacionalização

### Configuração i18n

1. **Middleware**: `LocaleMiddleware` ativo
2. **URLs**: Prefixo automático (`/pt-br/`, `/en/`)
3. **Templates**: Tags `{% trans %}` e `{% blocktrans %}`
4. **Arquivos**: `locale/en/LC_MESSAGES/django.po`

### Workflow de Tradução

```bash
# 1. Extrair strings para tradução
python manage.py makemessages -l en

# 2. Editar arquivo de tradução
# locale/en/LC_MESSAGES/django.po

# 3. Compilar traduções
python manage.py compilemessages

# 4. Reiniciar servidor
python manage.py runserver
```

### Exemplo de Template

```html
{% load i18n %}

<h1>{% trans "Meu Portfólio" %}</h1>

{% blocktrans %}
Olá, sou o João Marcos, desenvolvedor especializado em Django.
{% endblocktrans %}

<a href="{% url 'set_language' %}">
    {% trans "Mudar idioma" %}
</a>
```

## 🔐 Sistema Administrativo

### Customizações Admin

```python
# portfolio/admin.py
@admin.register(Projeto)
class ProjetoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'status', 'destaque', 'ordem', 'data_criacao']
    list_filter = ['status', 'destaque', 'tecnologias']
    search_fields = ['titulo', 'descricao_curta']
    prepopulated_fields = {'slug': ('titulo',)}
    filter_horizontal = ['tecnologias']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('titulo', 'subtitulo', 'slug')
        }),
        ('Descrições', {
            'fields': ('descricao_curta', 'descricao_completa')
        }),
        ('Mídia', {
            'fields': ('imagem_principal',)
        }),
        ('Tecnologias e Links', {
            'fields': ('tecnologias', 'link_repositorio', 'link_deploy')
        }),
        ('Configurações', {
            'fields': ('status', 'destaque', 'ordem', 'ativo')
        }),
    )
```

### Inline Admin

```python
class ImagemProjetoInline(admin.TabularInline):
    model = ImagemProjeto
    extra = 1
    fields = ['imagem', 'legenda', 'ordem']
    
class ProjetoAdmin(admin.ModelAdmin):
    inlines = [ImagemProjetoInline]
```

## 📊 Template Tags Customizadas

```python
# portfolio/templatetags/portfolio_stats.py
from django import template
from portfolio.models import Projeto

register = template.Library()

@register.simple_tag
def total_projetos():
    return Projeto.objects.filter(ativo=True).count()

@register.simple_tag
def projetos_destaque():
    return Projeto.objects.filter(destaque=True, ativo=True)

@register.inclusion_tag('portfolio/projeto_card.html')
def projeto_card(projeto):
    return {'projeto': projeto}
```

## 🚀 Deploy e Produção

### Railway Configuration

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn meu_portfolio.wsgi:application"

[env]
DJANGO_SETTINGS_MODULE = "meu_portfolio.settings"
```

### Procfile

```
web: gunicorn meu_portfolio.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate && python manage.py collectstatic --noinput
```

### Variáveis de Ambiente

```env
# Produção
SECRET_KEY=sua-chave-super-secreta
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:port/db
ALLOWED_HOST=seu-app.railway.app

# Desenvolvimento
DEBUG=True
SECRET_KEY=django-insecure-dev-key
```

## 🧪 Testes

### Estrutura de Testes

```python
# portfolio/tests.py
from django.test import TestCase, Client
from django.urls import reverse
from .models import Projeto, Tecnologia

class ProjetoModelTest(TestCase):
    def setUp(self):
        self.projeto = Projeto.objects.create(
            titulo="Teste",
            descricao_curta="Descrição teste",
            descricao_completa="Descrição completa teste"
        )
    
    def test_projeto_creation(self):
        self.assertEqual(self.projeto.titulo, "Teste")
        self.assertTrue(self.projeto.ativo)
    
    def test_projeto_str(self):
        self.assertEqual(str(self.projeto), "Teste")

class ProjetoViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.projeto = Projeto.objects.create(
            titulo="Teste View",
            descricao_curta="Teste",
            descricao_completa="Teste completo",
            ativo=True
        )
    
    def test_projeto_list_view(self):
        response = self.client.get(reverse('portfolio:projects'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Teste View")
```

### Executar Testes

```bash
# Todos os testes
python manage.py test

# Testes específicos
python manage.py test portfolio.tests.ProjetoModelTest

# Com coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## 📈 Performance e Otimização

### Queries Otimizadas

```python
# views.py
def projeto_list(request):
    projetos = Projeto.objects.filter(ativo=True)\
        .select_related()\
        .prefetch_related('tecnologias', 'imagemprojeto_set')\
        .order_by('-destaque', 'ordem', '-data_criacao')
    
    return render(request, 'portfolio/projects.html', {
        'projetos': projetos
    })
```

### Cache

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# views.py
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # 15 minutos
def home(request):
    return render(request, 'core/home.html')
```

### Compressão de Arquivos

```python
# settings.py
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Compressão automática
USE_GZIP = True
```

## 🔍 Debugging e Logs

### Configuração de Logs

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'portfolio': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

### Debug Toolbar (Desenvolvimento)

```python
# settings.py (apenas em DEBUG=True)
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
```

## 🛡️ Segurança

### Headers de Segurança

```python
# settings.py
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# HTTPS em produção
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
```

### Validação de Dados

```python
# forms.py
from django import forms
from django.core.validators import URLValidator

class ProjetoForm(forms.ModelForm):
    class Meta:
        model = Projeto
        fields = '__all__'
    
    def clean_link_repositorio(self):
        url = self.cleaned_data.get('link_repositorio')
        if url:
            validator = URLValidator()
            try:
                validator(url)
            except forms.ValidationError:
                raise forms.ValidationError('URL inválida')
        return url
```
