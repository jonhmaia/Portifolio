#!/usr/bin/env python
import os
import django
from django.core.management import execute_from_command_line
from django.db import connection

def main():
    # Obter a DATABASE_URL original ANTES de configurar Django
    original_db_url = os.environ.get('DATABASE_URL')
    print(f"📊 DATABASE_URL original: {original_db_url[:50]}...")
    
    # Verificar se existe DATABASE_PUBLIC_URL
    public_db_url = os.environ.get('DATABASE_PUBLIC_URL')
    if public_db_url:
        os.environ['DATABASE_URL'] = public_db_url
        print(f"🔄 Usando DATABASE_PUBLIC_URL")
    elif original_db_url and 'postgres.railway.internal' in original_db_url:
        # Fallback: substituir o host interno pelo público com porta correta
        public_db_url = original_db_url.replace(
            'postgres.railway.internal:5432',
            'switchback.proxy.rlwy.net:20104'
        )
        os.environ['DATABASE_URL'] = public_db_url
        print(f"🔄 Usando host público: switchback.proxy.rlwy.net:20104")
    
    # Configurar Django DEPOIS de modificar a DATABASE_URL
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meu_portfolio.settings')
    django.setup()
    
    try:
        # Testar conexão
        print("🔍 Testando conexão...")
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Conexão bem-sucedida!")
        
        # Executar migrações
        print("🚀 Executando migrações...")
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrações concluídas!")
        
        # Configurar dados iniciais
        print("📝 Configurando dados iniciais...")
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@portfolio.com')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        
        execute_from_command_line([
            'manage.py', 'setup_initial_data',
            '--email', admin_email,
            '--password', admin_password
        ])
        print("✅ Dados iniciais configurados!")
        
        # Coletar arquivos estáticos
        print("📦 Coletando arquivos estáticos...")
        execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
        print("✅ Arquivos estáticos coletados!")
        
        print("\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return 1
    
    finally:
        # Restaurar DATABASE_URL original
        if original_db_url:
            os.environ['DATABASE_URL'] = original_db_url
    
    return 0

if __name__ == '__main__':
    exit(main())