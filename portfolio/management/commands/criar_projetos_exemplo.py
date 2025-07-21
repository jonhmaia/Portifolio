from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from portfolio.models import Projeto, Tecnologia
from django.utils import timezone
import requests
from io import BytesIO

class Command(BaseCommand):
    help = 'Cria projetos de exemplo para demonstração'
    
    def handle(self, *args, **options):
        # Buscar tecnologias existentes
        django_tech = Tecnologia.objects.get(nome='Django')
        python_tech = Tecnologia.objects.get(nome='Python')
        js_tech = Tecnologia.objects.get(nome='JavaScript')
        react_tech = Tecnologia.objects.get(nome='React')
        postgres_tech = Tecnologia.objects.get(nome='PostgreSQL')
        bootstrap_tech = Tecnologia.objects.get(nome='Bootstrap')
        html_tech = Tecnologia.objects.get(nome='HTML5')
        css_tech = Tecnologia.objects.get(nome='CSS3')
        git_tech = Tecnologia.objects.get(nome='Git')
        
        projetos_exemplo = [
            {
                'titulo': 'Sistema de Gestão Empresarial',
                'subtitulo': 'Plataforma completa para gestão de negócios',
                'descricao_curta': 'Sistema web completo para gestão empresarial com módulos de vendas, estoque, clientes e relatórios financeiros.',
                'descricao_completa': '''Este projeto foi desenvolvido para automatizar e otimizar processos empresariais. 
                
Funcionalidades principais:
• Gestão completa de clientes e fornecedores
• Controle de estoque com alertas automáticos
• Sistema de vendas com emissão de notas fiscais
• Relatórios gerenciais e dashboard interativo
• Controle de usuários e permissões
• Integração com APIs de pagamento
                
O sistema foi construído com Django no backend, utilizando PostgreSQL como banco de dados e Bootstrap para uma interface responsiva e moderna.''',
                'tecnologias': [django_tech, python_tech, postgres_tech, bootstrap_tech, js_tech],
                'link_repositorio': 'https://github.com/joaomaia/sistema-gestao',
                'link_deploy': 'https://sistema-gestao.railway.app',
                'destaque': True,
                'ordem': 1,
                'status': 'concluido'
            },
            {
                'titulo': 'E-commerce Moderno',
                'subtitulo': 'Loja virtual com carrinho e pagamentos',
                'descricao_curta': 'Plataforma de e-commerce completa com carrinho de compras, sistema de pagamentos e painel administrativo.',
                'descricao_completa': '''E-commerce desenvolvido com foco na experiência do usuário e performance.
                
Características:
• Interface moderna e responsiva
• Carrinho de compras com persistência
• Sistema de pagamentos integrado
• Gestão de produtos e categorias
• Sistema de avaliações e comentários
• Painel administrativo completo
• Otimização para SEO
                
Utiliza React no frontend para uma experiência fluida e Django REST Framework no backend para APIs robustas.''',
                'tecnologias': [react_tech, django_tech, python_tech, js_tech, postgres_tech],
                'link_repositorio': 'https://github.com/joaomaia/ecommerce-react',
                'link_deploy': 'https://ecommerce-demo.railway.app',
                'destaque': True,
                'ordem': 2,
                'status': 'concluido'
            },
            {
                'titulo': 'API REST Completa',
                'subtitulo': 'API robusta com autenticação JWT',
                'descricao_curta': 'API REST desenvolvida com Django REST Framework, incluindo autenticação JWT, documentação automática e testes.',
                'descricao_completa': '''API REST profissional desenvolvida seguindo as melhores práticas.
                
Recursos implementados:
• Autenticação JWT com refresh tokens
• Documentação automática com Swagger
• Versionamento de API
• Throttling e rate limiting
• Testes automatizados
• Logs estruturados
• Deploy automatizado
                
Ideal para servir como backend para aplicações web e mobile, com endpoints bem documentados e seguros.''',
                'tecnologias': [django_tech, python_tech, postgres_tech],
                'link_repositorio': 'https://github.com/joaomaia/api-rest-django',
                'link_deploy': 'https://api-demo.railway.app/docs/',
                'destaque': False,
                'ordem': 3,
                'status': 'concluido'
            },
            {
                'titulo': 'Portfólio Pessoal',
                'subtitulo': 'Site pessoal com painel administrativo',
                'descricao_curta': 'Portfólio pessoal desenvolvido em Django com sistema de administração para gerenciar projetos e conteúdo.',
                'descricao_completa': '''Este próprio portfólio que você está visualizando!
                
Funcionalidades:
• Design responsivo e moderno
• Sistema de administração completo
• Gerenciamento de projetos via CRUD
• Sistema de tecnologias categorizadas
• Galeria de imagens por projeto
• Internacionalização (PT/EN)
• Deploy automatizado no Railway
                
Desenvolvido como demonstração das habilidades em desenvolvimento web full-stack.''',
                'tecnologias': [django_tech, python_tech, html_tech, css_tech, bootstrap_tech, git_tech],
                'link_repositorio': 'https://github.com/joaomaia/portfolio-django',
                'link_deploy': 'https://portfolio.railway.app',
                'destaque': True,
                'ordem': 0,
                'status': 'desenvolvimento'
            }
        ]
        
        created_count = 0
        
        for projeto_data in projetos_exemplo:
            # Verificar se o projeto já existe
            if not Projeto.objects.filter(titulo=projeto_data['titulo']).exists():
                # Extrair tecnologias
                tecnologias = projeto_data.pop('tecnologias')
                
                # Criar o projeto
                projeto = Projeto.objects.create(**projeto_data)
                
                # Adicionar tecnologias
                projeto.tecnologias.set(tecnologias)
                
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Projeto criado: {projeto.titulo}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠ Projeto já existe: {projeto_data["titulo"]}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Processo concluído!\n'
                f'📦 {created_count} projetos criados\n'
                f'🔗 Acesse o admin para gerenciar: http://127.0.0.1:8000/admin/'
            )
        )