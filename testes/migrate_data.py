#!/usr/bin/env python
"""
Script para migrar dados do SQLite local para PostgreSQL da Railway
Este script ajuda a transferir dados essenciais como superusuários, projetos e artigos.
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.contrib.auth.models import User
from django.db import transaction
import json
from datetime import datetime

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meu_portfolio.settings')
django.setup()

from portfolio.models import Projeto, Tecnologia, ImagemProjeto
from blog.models import Artigo

def criar_superusuario():
    """
    Cria um superusuário para acessar o admin
    """
    print("\n=== CRIANDO SUPERUSUÁRIO ===")
    
    username = input("Digite o nome de usuário (padrão: admin): ").strip() or "admin"
    email = input("Digite o email: ").strip()
    
    if User.objects.filter(username=username).exists():
        print(f"❌ Usuário '{username}' já existe!")
        return
    
    password = input("Digite a senha: ").strip()
    
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"✅ Superusuário '{username}' criado com sucesso!")
        return user
    except Exception as e:
        print(f"❌ Erro ao criar superusuário: {e}")
        return None

def criar_tecnologias_basicas():
    """
    Cria algumas tecnologias básicas para usar nos projetos
    """
    print("\n=== CRIANDO TECNOLOGIAS BÁSICAS ===")
    
    tecnologias_basicas = [
        {
            'nome': 'Python',
            'icone': 'fab fa-python',
            'cor': '#3776ab',
            'categoria': 'linguagem'
        },
        {
            'nome': 'Django',
            'icone': 'fab fa-python',
            'cor': '#092e20',
            'categoria': 'framework'
        },
        {
            'nome': 'JavaScript',
            'icone': 'fab fa-js-square',
            'cor': '#f7df1e',
            'categoria': 'linguagem'
        },
        {
            'nome': 'React',
            'icone': 'fab fa-react',
            'cor': '#61dafb',
            'categoria': 'framework'
        },
        {
            'nome': 'HTML/CSS',
            'icone': 'fab fa-html5',
            'cor': '#e34f26',
            'categoria': 'linguagem'
        },
        {
            'nome': 'PostgreSQL',
            'icone': 'fas fa-database',
            'cor': '#336791',
            'categoria': 'banco'
        },
        {
            'nome': 'Git',
            'icone': 'fab fa-git-alt',
            'cor': '#f05032',
            'categoria': 'ferramenta'
        },
        {
            'nome': 'Docker',
            'icone': 'fab fa-docker',
            'cor': '#2496ed',
            'categoria': 'ferramenta'
        }
    ]
    
    created_count = 0
    for tech_data in tecnologias_basicas:
        tecnologia, created = Tecnologia.objects.get_or_create(
            nome=tech_data['nome'],
            defaults=tech_data
        )
        if created:
            created_count += 1
            print(f"✅ Tecnologia '{tecnologia.nome}' criada")
        else:
            print(f"ℹ️  Tecnologia '{tecnologia.nome}' já existe")
    
    print(f"\n📊 {created_count} tecnologias criadas")
    return Tecnologia.objects.all()

def criar_projeto_exemplo():
    """
    Cria um projeto de exemplo
    """
    print("\n=== CRIANDO PROJETO DE EXEMPLO ===")
    
    if Projeto.objects.filter(titulo="Meu Portfólio Django").exists():
        print("ℹ️  Projeto de exemplo já existe")
        return
    
    # Buscar algumas tecnologias
    python = Tecnologia.objects.filter(nome="Python").first()
    django = Tecnologia.objects.filter(nome="Django").first()
    html_css = Tecnologia.objects.filter(nome="HTML/CSS").first()
    
    projeto = Projeto.objects.create(
        titulo="Meu Portfólio Django",
        subtitulo="Site pessoal desenvolvido com Django",
        descricao_curta="Portfólio pessoal para exibir projetos e artigos, desenvolvido com Django e Tailwind CSS.",
        descricao_completa="""Este é meu portfólio pessoal desenvolvido com Django, onde compartilho meus projetos e artigos sobre desenvolvimento.
        
Funcionalidades:
        - Sistema de gerenciamento de projetos
        - Blog integrado
        - Interface administrativa
        - Design responsivo com Tailwind CSS
        - SEO otimizado
        - Internacionalização (PT/EN)""",
        status='concluido',
        destaque=True,
        ativo=True,
        ordem=1
    )
    
    # Adicionar tecnologias
    if python:
        projeto.tecnologias.add(python)
    if django:
        projeto.tecnologias.add(django)
    if html_css:
        projeto.tecnologias.add(html_css)
    
    print(f"✅ Projeto '{projeto.titulo}' criado com sucesso!")
    return projeto

def criar_artigo_exemplo():
    """
    Cria um artigo de exemplo
    """
    print("\n=== CRIANDO ARTIGO DE EXEMPLO ===")
    
    if Artigo.objects.filter(titulo="Bem-vindo ao meu blog!").exists():
        print("ℹ️  Artigo de exemplo já existe")
        return
    
    # Buscar um usuário para ser o autor
    autor = User.objects.filter(is_superuser=True).first()
    if not autor:
        print("❌ Nenhum superusuário encontrado para ser autor")
        return
    
    artigo = Artigo.objects.create(
        titulo="Bem-vindo ao meu blog!",
        autor=autor,
        conteudo="""# Bem-vindo ao meu blog!

Olá! Este é meu primeiro artigo no blog. Aqui vou compartilhar:

## 🚀 Projetos
- Experiências com desenvolvimento
- Tutoriais e dicas
- Novidades em tecnologia

## 💡 Aprendizados
- Lições aprendidas em projetos
- Melhores práticas
- Ferramentas úteis

## 🎯 Objetivos
- Compartilhar conhecimento
- Conectar com outros desenvolvedores
- Documentar minha jornada

Fique à vontade para explorar e deixar comentários!

---

*Este é um artigo de exemplo criado automaticamente.*""",
        resumo="Primeiro artigo do blog, apresentando os objetivos e o que você pode esperar encontrar aqui.",
        status='publicado'
    )
    
    print(f"✅ Artigo '{artigo.titulo}' criado com sucesso!")
    return artigo

def exportar_dados_sqlite():
    """
    Exporta dados do SQLite local para um arquivo JSON
    (Use este método se você ainda tem acesso ao banco SQLite local)
    """
    print("\n=== EXPORTANDO DADOS DO SQLITE ===")
    
    # Verificar se existe banco SQLite
    sqlite_path = 'db.sqlite3'
    if not os.path.exists(sqlite_path):
        print(f"❌ Arquivo {sqlite_path} não encontrado")
        return False
    
    dados = {
        'usuarios': [],
        'projetos': [],
        'tecnologias': [],
        'artigos': []
    }
    
    try:
        # Exportar usuários
        for user in User.objects.all():
            dados['usuarios'].append({
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_superuser': user.is_superuser,
                'is_staff': user.is_staff,
                'date_joined': user.date_joined.isoformat()
            })
        
        # Exportar tecnologias
        for tech in Tecnologia.objects.all():
            dados['tecnologias'].append({
                'nome': tech.nome,
                'icone': tech.icone,
                'cor': tech.cor,
                'categoria': tech.categoria,
                'ativo': tech.ativo
            })
        
        # Exportar projetos
        for projeto in Projeto.objects.all():
            dados['projetos'].append({
                'titulo': projeto.titulo,
                'subtitulo': projeto.subtitulo,
                'descricao_curta': projeto.descricao_curta,
                'descricao_completa': projeto.descricao_completa,
                'tecnologias': [t.nome for t in projeto.tecnologias.all()],
                'link_repositorio': projeto.link_repositorio,
                'link_deploy': projeto.link_deploy,
                'destaque': projeto.destaque,
                'ordem': projeto.ordem,
                'status': projeto.status,
                'ativo': projeto.ativo,
                'data_criacao': projeto.data_criacao.isoformat()
            })
        
        # Exportar artigos
        for artigo in Artigo.objects.all():
            dados['artigos'].append({
                'titulo': artigo.titulo,
                'slug': artigo.slug,
                'autor_username': artigo.autor.username,
                'conteudo': artigo.conteudo,
                'resumo': artigo.resumo,
                'status': artigo.status,
                'visualizacoes': artigo.visualizacoes,
                'data_publicacao': artigo.data_publicacao.isoformat()
            })
        
        # Salvar em arquivo
        with open('dados_backup.json', 'w', encoding='utf-8') as f:
            json.dump(dados, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Dados exportados para 'dados_backup.json'")
        print(f"📊 Exportados: {len(dados['usuarios'])} usuários, {len(dados['tecnologias'])} tecnologias, {len(dados['projetos'])} projetos, {len(dados['artigos'])} artigos")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao exportar dados: {e}")
        return False

def main():
    print("🚀 SCRIPT DE MIGRAÇÃO DE DADOS")
    print("=" * 50)
    
    print("\nOpções disponíveis:")
    print("1. Criar superusuário")
    print("2. Criar tecnologias básicas")
    print("3. Criar projeto de exemplo")
    print("4. Criar artigo de exemplo")
    print("5. Fazer tudo (recomendado para novo banco)")
    print("6. Exportar dados do SQLite (se disponível)")
    
    opcao = input("\nEscolha uma opção (1-6): ").strip()
    
    try:
        with transaction.atomic():
            if opcao == "1":
                criar_superusuario()
            elif opcao == "2":
                criar_tecnologias_basicas()
            elif opcao == "3":
                criar_projeto_exemplo()
            elif opcao == "4":
                criar_artigo_exemplo()
            elif opcao == "5":
                print("\n🔄 Executando migração completa...")
                user = criar_superusuario()
                criar_tecnologias_basicas()
                criar_projeto_exemplo()
                if user:
                    criar_artigo_exemplo()
                print("\n✅ Migração completa finalizada!")
            elif opcao == "6":
                exportar_dados_sqlite()
            else:
                print("❌ Opção inválida")
                return
        
        print("\n🎉 Operação concluída com sucesso!")
        print("\n📝 Próximos passos:")
        print("1. Acesse o admin: /admin/")
        print("2. Faça login com o superusuário criado")
        print("3. Adicione seus projetos e artigos")
        
    except Exception as e:
        print(f"\n❌ Erro durante a operação: {e}")
        print("\n🔄 Todas as alterações foram revertidas.")

if __name__ == "__main__":
    main()