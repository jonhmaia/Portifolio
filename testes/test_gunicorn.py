#!/usr/bin/env python
"""
Teste específico para Gunicorn no Railway
Simula exatamente como o Railway executa a aplicação
"""

import os
import sys
import subprocess
import time
import requests
from threading import Thread

def test_gunicorn_startup():
    print("=== TESTE GUNICORN RAILWAY ===")
    
    # Configurar ambiente Railway
    os.environ['RAILWAY_ENVIRONMENT'] = 'production'
    os.environ['DEBUG'] = 'False'
    os.environ['PORT'] = '8001'  # Usar porta diferente para não conflitar
    
    if 'SECRET_KEY' not in os.environ:
        os.environ['SECRET_KEY'] = 'railway-test-key-12345-very-long-secret-key-for-testing'
    
    print(f"✅ Ambiente configurado - PORT: {os.environ['PORT']}")
    
    # Comando exato do Procfile
    cmd = ['gunicorn', 'meu_portfolio.wsgi:application', '--bind', f"0.0.0.0:{os.environ['PORT']}"]
    
    print(f"🚀 Executando: {' '.join(cmd)}")
    
    try:
        # Iniciar Gunicorn
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=os.getcwd()
        )
        
        # Aguardar inicialização
        print("⏳ Aguardando inicialização do Gunicorn...")
        time.sleep(5)
        
        # Verificar se o processo ainda está rodando
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            print(f"❌ Gunicorn falhou ao iniciar")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return False
        
        print("✅ Gunicorn iniciado com sucesso")
        
        # Testar conexão HTTP
        test_url = f"http://127.0.0.1:{os.environ['PORT']}/"
        print(f"🌐 Testando conexão: {test_url}")
        
        try:
            response = requests.get(test_url, timeout=10)
            print(f"✅ Resposta HTTP: {response.status_code}")
            if response.status_code == 200:
                print("🎉 APLICAÇÃO FUNCIONANDO CORRETAMENTE!")
                success = True
            else:
                print(f"⚠️  Status code inesperado: {response.status_code}")
                print(f"Conteúdo: {response.text[:200]}...")
                success = False
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro na conexão HTTP: {e}")
            success = False
        
        # Finalizar processo
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
        
        return success
        
    except Exception as e:
        print(f"❌ Erro ao executar Gunicorn: {e}")
        return False

def check_dependencies():
    print("\n=== VERIFICANDO DEPENDÊNCIAS ===")
    
    required_packages = [
        'django',
        'gunicorn',
        'whitenoise',
        'python-decouple',
        'dj-database-url'
    ]
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - NÃO ENCONTRADO")
            return False
    
    return True

if __name__ == '__main__':
    print("Verificando dependências...")
    if not check_dependencies():
        print("❌ Dependências faltando")
        sys.exit(1)
    
    print("\nTestando Gunicorn...")
    success = test_gunicorn_startup()
    
    if success:
        print("\n🎉 TODOS OS TESTES PASSARAM - APLICAÇÃO PRONTA PARA RAILWAY")
        sys.exit(0)
    else:
        print("\n❌ TESTES FALHARAM - VERIFICAR CONFIGURAÇÕES")
        sys.exit(1)