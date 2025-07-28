#!/usr/bin/env python
"""
Script para testar conexão e migrar dados para Railway
"""

import os
import sys
import django
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()

def test_connection():
    """
    Testa a conexão com o banco de dados
    """
    print("🔍 Testando conexão com PostgreSQL...")
    
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meu_portfolio.settings')
        django.setup()
        
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✅ Conexão bem-sucedida!")
            print(f"📊 PostgreSQL: {version[:50]}...")
            return True
            
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")
        return False

def run_migrations():
    """
    Executa as migrações
    """
    print("\n🔄 Executando migrações...")
    
    try:
        from django.core.management import execute_from_command_line
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrações executadas com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro nas migrações: {e}")
        return False

def setup_initial_data():
    """
    Configura dados iniciais
    """
    print("\n📊 Configurando dados iniciais...")
    
    try:
        from django.core.management import execute_from_command_line
        execute_from_command_line([
            'manage.py', 'setup_initial_data', 
            '--email', 'admin@portfolio.com',
            '--password', 'admin123'
        ])
        print("✅ Dados iniciais configurados!")
        return True
    except Exception as e:
        print(f"❌ Erro ao configurar dados: {e}")
        return False

def import_backup_data():
    """
    Importa dados do backup se existir
    """
    backup_file = 'dados_essenciais.json'
    
    if os.path.exists(backup_file):
        print(f"\n📥 Importando dados do backup: {backup_file}")
        
        try:
            from django.core.management import execute_from_command_line
            execute_from_command_line(['manage.py', 'loaddata', backup_file])
            print("✅ Dados importados com sucesso!")
            return True
        except Exception as e:
            print(f"❌ Erro ao importar dados: {e}")
            print("ℹ️  Continuando com dados iniciais básicos...")
            return False
    else:
        print(f"\nℹ️  Arquivo de backup não encontrado: {backup_file}")
        return False

def verify_data():
    """
    Verifica se os dados foram criados corretamente
    """
    print("\n🔍 Verificando dados criados...")
    
    try:
        from django.contrib.auth.models import User
        from portfolio.models import Projeto, Tecnologia
        from blog.models import Artigo
        
        users = User.objects.count()
        superusers = User.objects.filter(is_superuser=True).count()
        projects = Projeto.objects.count()
        technologies = Tecnologia.objects.count()
        articles = Artigo.objects.count()
        
        print(f"👥 Usuários: {users} (Superusuários: {superusers})")
        print(f"🚀 Projetos: {projects}")
        print(f"⚙️  Tecnologias: {technologies}")
        print(f"📝 Artigos: {articles}")
        
        if superusers > 0:
            print("\n✅ Pelo menos um superusuário foi criado!")
            print("🔑 Credenciais padrão: admin / admin123")
            return True
        else:
            print("\n⚠️  Nenhum superusuário encontrado!")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao verificar dados: {e}")
        return False

def main():
    print("🚀 MIGRAÇÃO DE DADOS PARA RAILWAY")
    print("=" * 50)
    
    # Verificar variáveis de ambiente
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL não configurada!")
        print("Configure no arquivo .env ou nas variáveis de ambiente.")
        return
    
    if 'postgresql' not in database_url:
        print("⚠️  DATABASE_URL não aponta para PostgreSQL!")
        print(f"URL atual: {database_url[:50]}...")
        return
    
    print(f"📊 Usando banco: {database_url[:50]}...")
    
    # Testar conexão
    if not test_connection():
        print("\n❌ Não foi possível conectar ao banco.")
        print("\n💡 Soluções:")
        print("1. Verificar se o PostgreSQL está ativo na Railway")
        print("2. Verificar se a URL do banco está correta")
        print("3. Tentar executar diretamente na Railway:")
        print("   railway run python manage.py migrate")
        print("   railway run python manage.py setup_initial_data --email admin@portfolio.com --password admin123")
        return
    
    # Executar migrações
    if not run_migrations():
        print("\n❌ Falha nas migrações. Verifique os logs.")
        return
    
    # Tentar importar backup primeiro
    backup_imported = import_backup_data()
    
    # Se não conseguiu importar backup, criar dados iniciais
    if not backup_imported:
        if not setup_initial_data():
            print("\n❌ Falha ao configurar dados iniciais.")
            return
    
    # Verificar se tudo foi criado
    if verify_data():
        print("\n" + "=" * 50)
        print("🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
        print("\n📝 Próximos passos:")
        print("1. Acessar o admin: /admin/")
        print("2. Fazer login com: admin / admin123")
        print("3. Adicionar seus projetos e artigos")
        print("4. Personalizar o conteúdo")
        print("\n💾 Fazer backup:")
        print("   python manage.py dumpdata > backup_railway.json")
    else:
        print("\n⚠️  Migração parcialmente concluída. Verifique os dados.")

if __name__ == "__main__":
    main()