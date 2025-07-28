# 🚀 Guia de Migração: SQLite → PostgreSQL (Railway)

Este guia te ajudará a migrar seus dados do SQLite local para o PostgreSQL na Railway.

## 📋 Pré-requisitos

1. ✅ Projeto Django funcionando localmente
2. ✅ Banco PostgreSQL criado na Railway
3. ✅ Variáveis de ambiente configuradas

## 🔧 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

No Railway, configure estas variáveis:

```bash
# URL do banco PostgreSQL (fornecida pela Railway)
DATABASE_URL=postgresql://user:password@host:port/database

# Chave secreta do Django
SECRET_KEY=sua-chave-secreta-aqui

# Ambiente de produção
DJANGO_ENV=production
```

### 2. Testar Conexão

```bash
# Testar se a conexão está funcionando
python setup_railway_db.py
```

## 📊 Opções de Migração

### Opção 1: Dados Iniciais Básicos (Recomendado)

Se você não tem muitos dados ou quer começar "limpo":

```bash
# Executar migrações
python manage.py migrate

# Configurar dados iniciais (superusuário + exemplos)
python manage.py setup_initial_data --email admin@exemplo.com --password minhasenha123
```

### Opção 2: Migração Completa dos Dados

Se você tem dados importantes no SQLite:

#### 2.1. Exportar Dados do SQLite

```bash
# Usar o script de migração interativo
python migrate_data.py

# Escolher opção 1: "Exportar dados do SQLite local"
```

Isso criará um arquivo `dados_exportados.json` com seus dados.

#### 2.2. Importar para PostgreSQL

```bash
# Executar migrações no PostgreSQL
python manage.py migrate

# Importar os dados exportados
python manage.py loaddata dados_exportados.json
```

### Opção 3: Migração Manual

Se você tem poucos dados específicos:

```bash
# Executar migrações
python manage.py migrate

# Usar o script interativo para criar dados manualmente
python migrate_data.py

# Escolher opção 2: "Configurar dados no PostgreSQL"
```

## 🔍 Verificação

### Verificar se os dados foram migrados:

```bash
# Acessar o shell do Django
python manage.py shell
```

```python
# No shell do Django
from django.contrib.auth.models import User
from portfolio.models import Projeto, Tecnologia
from blog.models import Artigo

# Verificar usuários
print(f"Usuários: {User.objects.count()}")
print(f"Superusuários: {User.objects.filter(is_superuser=True).count()}")

# Verificar projetos
print(f"Projetos: {Projeto.objects.count()}")
print(f"Tecnologias: {Tecnologia.objects.count()}")

# Verificar artigos
print(f"Artigos: {Artigo.objects.count()}")
```

## 🚨 Solução de Problemas

### Erro de Conexão

```bash
# Verificar variáveis de ambiente
python setup_railway_db.py
```

### Erro de Migração

```bash
# Resetar migrações (CUIDADO: apaga dados)
python manage.py migrate --fake-initial

# Ou aplicar migrações específicas
python manage.py migrate portfolio
python manage.py migrate blog
```

### Erro de Importação de Dados

```bash
# Limpar dados existentes (se necessário)
python manage.py shell
```

```python
# No shell (CUIDADO: apaga todos os dados)
from django.contrib.auth.models import User
from portfolio.models import Projeto, Tecnologia, ImagemProjeto
from blog.models import Artigo

# Apagar dados (se necessário recomeçar)
ImagemProjeto.objects.all().delete()
Projeto.objects.all().delete()
Tecnologia.objects.all().delete()
Artigo.objects.all().delete()
User.objects.filter(is_superuser=False).delete()  # Manter superusuários
```

## 📝 Comandos Úteis

```bash
# Criar superusuário manualmente
python manage.py createsuperuser

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Executar servidor local
python manage.py runserver

# Verificar status das migrações
python manage.py showmigrations

# Fazer backup dos dados (após migração)
python manage.py dumpdata > backup_railway.json
```

## 🎯 Fluxo Recomendado

1. **Testar conexão**: `python setup_railway_db.py`
2. **Executar migrações**: `python manage.py migrate`
3. **Configurar dados iniciais**: `python manage.py setup_initial_data --email seu@email.com --password suasenha`
4. **Verificar no admin**: Acessar `/admin/` e fazer login
5. **Adicionar seus projetos e artigos** através da interface admin
6. **Fazer backup**: `python manage.py dumpdata > backup_final.json`

## 🔐 Segurança

- ✅ Nunca commite credenciais no código
- ✅ Use variáveis de ambiente para dados sensíveis
- ✅ Mantenha backups regulares
- ✅ Teste em ambiente local antes de aplicar em produção

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Railway
2. Execute `python setup_railway_db.py` para diagnóstico
3. Consulte a documentação do Django sobre migrações
4. Verifique se todas as dependências estão instaladas

---

**Boa sorte com a migração! 🚀**