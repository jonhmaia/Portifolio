#!/usr/bin/env python
"""
Script para configurar e testar conexão com PostgreSQL da Railway
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.db import connection
from django.core.management.utils import get_random_secret_key

def test_database_connection():
    """
    Testa a conexão com o banco de dados
    """
    print("🔍 Testando conexão com o banco de dados...")
    
    try:
        # Configurar Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meu_portfolio.settings')
        django.setup()
        
        # Testar conexão
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✅ Conexão bem-sucedida!")
            print(f"📊 Versão do PostgreSQL: {version}")
            
            # Verificar tabelas existentes
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            if tables:
                print(f"\n📋 Tabelas encontradas ({len(tables)}):")
                for table in tables:
                    print(f"  - {table[0]}")
            else:
                print("\n⚠️  Nenhuma tabela encontrada. Execute as migrações primeiro.")
            
            return True
            
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")
        print("\n🔧 Verifique:")
        print("1. Se a variável DATABASE_URL está configurada")
        print("2. Se o banco PostgreSQL está ativo na Railway")
        print("3. Se as credenciais estão corretas")
        return False

def check_environment():
    """
    Verifica as variáveis de ambiente necessárias
    """
    print("🔍 Verificando variáveis de ambiente...")
    
    required_vars = {
        'DATABASE_URL': 'URL de conexão com PostgreSQL',
        'SECRET_KEY': 'Chave secreta do Django'
    }
    
    missing_vars = []
    
    for var, description in required_vars.items():
        value = os.environ.get(var)
        if value:
            # Mascarar valores sensíveis
            if 'SECRET' in var or 'PASSWORD' in var:
                display_value = f"{value[:10]}..." if len(value) > 10 else "***"
            elif 'DATABASE_URL' in var:
                # Mascarar senha na URL do banco
                if '@' in value:
                    parts = value.split('@')
                    if len(parts) == 2:
                        user_pass = parts[0].split('//')[-1]
                        if ':' in user_pass:
                            user, _ = user_pass.split(':', 1)
                            display_value = f"postgresql://{user}:***@{parts[1]}"
                        else:
                            display_value = value
                    else:
                        display_value = value
                else:
                    display_value = value
            else:
                display_value = value
            
            print(f"✅ {var}: {display_value}")
        else:
            print(f"❌ {var}: NÃO CONFIGURADA ({description})")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n⚠️  Variáveis faltando: {', '.join(missing_vars)}")
        print("\n📝 Configure no Railway ou no arquivo .env:")
        for var in missing_vars:
            if var == 'SECRET_KEY':
                secret_key = get_random_secret_key()
                print(f"SECRET_KEY={secret_key}")
            elif var == 'DATABASE_URL':
                print("DATABASE_URL=postgresql://user:password@host:port/database")
        return False
    
    return True

def run_migrations():
    """
    Executa as migrações do Django
    """
    print("\n🔄 Executando migrações...")
    
    try:
        # Configurar Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meu_portfolio.settings')
        
        # Executar migrações
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrações executadas com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao executar migrações: {e}")
        return False

def main():
    print("🚀 CONFIGURAÇÃO DO BANCO RAILWAY")
    print("=" * 50)
    
    # Verificar variáveis de ambiente
    if not check_environment():
        print("\n❌ Configure as variáveis de ambiente antes de continuar.")
        return
    
    # Testar conexão
    if not test_database_connection():
        print("\n❌ Não foi possível conectar ao banco. Verifique a configuração.")
        return
    
    print("\n" + "=" * 50)
    print("🎉 BANCO CONFIGURADO COM SUCESSO!")
    print("\n📝 Próximos passos:")
    print("\n1. Executar migrações (se ainda não executou):")
    print("   python manage.py migrate")
    print("\n2. Configurar dados iniciais:")
    print("   python manage.py setup_initial_data --email seu@email.com --password suasenha")
    print("\n3. Ou usar o script interativo:")
    print("   python migrate_data.py")
    print("\n4. Coletar arquivos estáticos:")
    print("   python manage.py collectstatic --noinput")
    print("\n5. Testar o servidor:")
    print("   python manage.py runserver")

if __name__ == "__main__":
    main()