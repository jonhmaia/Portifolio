#!/usr/bin/env python
"""
Script de diagnóstico para Railway
Testa a inicialização da aplicação Django em ambiente de produção
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.core.wsgi import get_wsgi_application

def test_railway_environment():
    print("=== DIAGNÓSTICO RAILWAY ===")
    
    # Simular ambiente Railway
    os.environ['RAILWAY_ENVIRONMENT'] = 'production'
    os.environ['DEBUG'] = 'False'
    os.environ['PORT'] = '8000'
    
    # Verificar se SECRET_KEY está definida
    if 'SECRET_KEY' not in os.environ:
        print("⚠️  SECRET_KEY não definida, usando padrão")
        os.environ['SECRET_KEY'] = 'railway-test-key-12345'
    
    print(f"✅ RAILWAY_ENVIRONMENT: {os.environ.get('RAILWAY_ENVIRONMENT')}")
    print(f"✅ DEBUG: {os.environ.get('DEBUG')}")
    print(f"✅ PORT: {os.environ.get('PORT')}")
    print(f"✅ SECRET_KEY: {'***' if os.environ.get('SECRET_KEY') else 'NOT SET'}")
    
    try:
        # Configurar Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meu_portfolio.settings')
        django.setup()
        
        print("✅ Django setup concluído")
        
        # Testar importação das configurações
        from django.conf import settings
        print(f"✅ DEBUG: {settings.DEBUG}")
        print(f"✅ ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        print(f"✅ SECRET_KEY definida: {bool(settings.SECRET_KEY)}")
        
        # Testar WSGI application
        application = get_wsgi_application()
        print("✅ WSGI application criada com sucesso")
        
        # Testar check do Django
        print("\n=== EXECUTANDO DJANGO CHECK ===")
        from django.core.management.commands.check import Command
        check_command = Command()
        try:
            check_command.handle(verbosity=2)
            print("✅ Django check passou")
        except Exception as e:
            print(f"❌ Django check falhou: {e}")
            return False
        
        # Testar collectstatic
        print("\n=== TESTANDO COLLECTSTATIC ===")
        try:
            execute_from_command_line(['manage.py', 'collectstatic', '--noinput', '--verbosity=0'])
            print("✅ Collectstatic executado com sucesso")
        except Exception as e:
            print(f"❌ Collectstatic falhou: {e}")
            return False
        
        print("\n🎉 TODOS OS TESTES PASSARAM - APLICAÇÃO PRONTA PARA RAILWAY")
        return True
        
    except Exception as e:
        print(f"❌ Erro durante inicialização: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_railway_environment()
    sys.exit(0 if success else 1)