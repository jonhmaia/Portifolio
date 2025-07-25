# 🚀 Guia de Deploy - Portfólio Django

## 📋 Pré-requisitos

### Desenvolvimento Local
- Python 3.11+
- Node.js 18+ (para Tailwind CSS)
- Git
- PostgreSQL (opcional, SQLite por padrão)

### Produção
- Conta no Railway/Heroku/DigitalOcean
- Banco PostgreSQL
- Domínio personalizado (opcional)

## 🛠️ Setup Local

### 1. Clone e Configuração Inicial

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd novo-port

# Crie ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Instale dependências Python
pip install -r requirements.txt
```

### 2. Configuração do Banco de Dados

```bash
# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Carregar dados de exemplo (opcional)
python manage.py loaddata fixtures/initial_data.json
```

### 3. Configuração do Tailwind CSS

```bash
# Navegar para o diretório do Tailwind
cd jedi/static_src

# Instalar dependências Node.js
npm install

# Compilar CSS para desenvolvimento (watch mode)
npm run dev

# Em outro terminal, voltar para a raiz e iniciar Django
cd ../..
python manage.py runserver
```

### 4. Configuração de Internacionalização

```bash
# Gerar arquivos de tradução
python manage.py makemessages -l en

# Compilar traduções
python manage.py compilemessages

# Ou usar o script personalizado
python compile_translations.py
```

## 🌐 Deploy em Produção

### Railway (Recomendado)

#### 1. Preparação do Projeto

```bash
# Criar arquivo railway.toml
echo '[build]
builder = "NIXPACKS"

[deploy]
startCommand = "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn meu_portfolio.wsgi:application"

[env]
DJANGO_SETTINGS_MODULE = "meu_portfolio.settings"' > railway.toml
```

#### 2. Configurar Variáveis de Ambiente

No painel do Railway, configure:

```env
# Essenciais
SECRET_KEY=sua-chave-super-secreta-aqui
DEBUG=False
ALLOWED_HOSTS=seu-app.railway.app,www.seudominio.com

# Banco de dados (Railway PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:port/db

# Opcional
DJANGO_SETTINGS_MODULE=meu_portfolio.settings
PORT=8000
```

#### 3. Deploy

```bash
# Conectar ao Railway
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

### Heroku

#### 1. Preparação

```bash
# Criar Procfile
echo 'web: gunicorn meu_portfolio.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate && python manage.py collectstatic --noinput' > Procfile

# Instalar Heroku CLI e fazer login
heroku login

# Criar app
heroku create seu-portfolio-app
```

#### 2. Configurar Add-ons

```bash
# PostgreSQL
heroku addons:create heroku-postgresql:mini

# Redis (opcional, para cache)
heroku addons:create heroku-redis:mini
```

#### 3. Configurar Variáveis

```bash
heroku config:set SECRET_KEY=sua-chave-secreta
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=seu-portfolio-app.herokuapp.com
```

#### 4. Deploy

```bash
git push heroku main
```

### DigitalOcean App Platform

#### 1. Criar app.yaml

```yaml
name: portfolio-django
services:
- name: web
  source_dir: /
  github:
    repo: seu-usuario/seu-repositorio
    branch: main
  run_command: gunicorn meu_portfolio.wsgi:application --bind 0.0.0.0:8080
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: SECRET_KEY
    value: sua-chave-secreta
  - key: DEBUG
    value: "False"
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
databases:
- name: db
  engine: PG
  version: "13"
  size: basic-xs
```

## 🔧 Configurações de Produção

### settings.py para Produção

```python
# meu_portfolio/settings.py
import os
import dj_database_url
from pathlib import Path

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR}/db.sqlite3',
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    BASE_DIR / 'jedi' / 'static',
]

# WhiteNoise para servir arquivos estáticos
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Security settings para produção
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
```

### requirements.txt Completo

```txt
Django==4.2.7
django-tailwind==3.6.0
Pillow==10.1.0
whitenoise==6.6.0
dj-database-url==2.1.0
psycopg2-binary==2.9.9
gunicorn==21.2.0
python-decouple==3.8
django-extensions==3.2.3
django-debug-toolbar==4.2.0
```

## 📊 Monitoramento e Logs

### Configuração de Logs

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': 'django_errors.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

### Comandos Úteis para Produção

```bash
# Verificar logs (Railway)
railway logs

# Verificar logs (Heroku)
heroku logs --tail

# Executar comandos remotos (Heroku)
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
heroku run python manage.py collectstatic

# Backup do banco (Heroku)
heroku pg:backups:capture
heroku pg:backups:download
```

## 🔄 CI/CD com GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        python manage.py test
    
    - name: Run linting
      run: |
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Railway
      uses: railway-app/railway-deploy@v1
      with:
        railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🛡️ Backup e Recuperação

### Script de Backup

```bash
#!/bin/bash
# backup.sh

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
python manage.py dumpdata --natural-foreign --natural-primary > $BACKUP_DIR/db_backup_$DATE.json

# Backup dos arquivos de media
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz media/

echo "Backup criado: $DATE"
```

### Restauração

```bash
# Restaurar banco de dados
python manage.py loaddata backups/db_backup_YYYYMMDD_HHMMSS.json

# Restaurar arquivos de media
tar -xzf backups/media_backup_YYYYMMDD_HHMMSS.tar.gz
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Erro de Static Files
```bash
# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Verificar configuração STATIC_ROOT
echo $STATIC_ROOT
```

#### 2. Erro de Banco de Dados
```bash
# Verificar conexão
python manage.py dbshell

# Aplicar migrações
python manage.py migrate
```

#### 3. Erro de Tradução
```bash
# Recompilar traduções
python manage.py compilemessages

# Verificar arquivos .po
find . -name "*.po" -exec msgfmt --check {} \;
```

#### 4. Erro de CSS (Tailwind)
```bash
# Recompilar CSS
cd jedi/static_src
npm run build

# Verificar se o arquivo foi gerado
ls -la static/css/
```

### Logs Importantes

```bash
# Django logs
tail -f django_errors.log

# Nginx logs (se usando)
tail -f /var/log/nginx/error.log

# Gunicorn logs
tail -f gunicorn.log
```

## 📈 Performance

### Otimizações Recomendadas

1. **Cache Redis**
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/1'),
    }
}
```

2. **Compressão Gzip**
```python
# Middleware
'django.middleware.gzip.GZipMiddleware',
```

3. **CDN para Static Files**
```python
# AWS S3 + CloudFront
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
```

---

**🚀 Pronto para Deploy!** Siga este guia passo a passo para colocar seu portfólio no ar com segurança e performance otimizada.