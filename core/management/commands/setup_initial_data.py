from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from portfolio.models import Projeto, Tecnologia
from blog.models import Artigo

class Command(BaseCommand):
    help = 'Configura dados iniciais para o portfólio (superusuário, tecnologias, exemplos)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Nome de usuário para o superusuário (padrão: admin)'
        )
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Email para o superusuário'
        )
        parser.add_argument(
            '--password',
            type=str,
            required=True,
            help='Senha para o superusuário'
        )
        parser.add_argument(
            '--skip-examples',
            action='store_true',
            help='Pular criação de dados de exemplo'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Configurando dados iniciais do portfólio...')
        )

        try:
            with transaction.atomic():
                # Criar superusuário
                user = self.create_superuser(
                    options['username'],
                    options['email'],
                    options['password']
                )

                # Criar tecnologias básicas
                self.create_basic_technologies()

                # Criar dados de exemplo (se não foi pulado)
                if not options['skip_examples']:
                    self.create_example_project()
                    if user:
                        self.create_example_article(user)

                self.stdout.write(
                    self.style.SUCCESS('\n✅ Configuração inicial concluída com sucesso!')
                )
                self.stdout.write(
                    self.style.WARNING('\n📝 Próximos passos:')
                )
                self.stdout.write('1. Acesse o admin: /admin/')
                self.stdout.write(f'2. Faça login com: {options["username"]}')
                self.stdout.write('3. Adicione seus projetos e artigos')

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erro durante a configuração: {e}')
            )
            raise

    def create_superuser(self, username, email, password):
        """Cria um superusuário"""
        self.stdout.write('\n=== CRIANDO SUPERUSUÁRIO ===')
        
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'⚠️  Usuário "{username}" já existe!')
            )
            return User.objects.get(username=username)

        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f'✅ Superusuário "{username}" criado com sucesso!')
            )
            return user
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erro ao criar superusuário: {e}')
            )
            return None

    def create_basic_technologies(self):
        """Cria tecnologias básicas"""
        self.stdout.write('\n=== CRIANDO TECNOLOGIAS BÁSICAS ===')
        
        technologies = [
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
            },
            {
                'nome': 'Tailwind CSS',
                'icone': 'fas fa-palette',
                'cor': '#06b6d4',
                'categoria': 'framework'
            },
            {
                'nome': 'Railway',
                'icone': 'fas fa-train',
                'cor': '#0B0D0E',
                'categoria': 'ferramenta'
            }
        ]
        
        created_count = 0
        for tech_data in technologies:
            tecnologia, created = Tecnologia.objects.get_or_create(
                nome=tech_data['nome'],
                defaults=tech_data
            )
            if created:
                created_count += 1
                self.stdout.write(f'✅ Tecnologia "{tecnologia.nome}" criada')
            else:
                self.stdout.write(f'ℹ️  Tecnologia "{tecnologia.nome}" já existe')
        
        self.stdout.write(f'\n📊 {created_count} tecnologias criadas')

    def create_example_project(self):
        """Cria um projeto de exemplo"""
        self.stdout.write('\n=== CRIANDO PROJETO DE EXEMPLO ===')
        
        if Projeto.objects.filter(titulo="Meu Portfólio Django").exists():
            self.stdout.write('ℹ️  Projeto de exemplo já existe')
            return
        
        projeto = Projeto.objects.create(
            titulo="Meu Portfólio Django",
            subtitulo="Site pessoal desenvolvido com Django e Railway",
            descricao_curta="Portfólio pessoal para exibir projetos e artigos, desenvolvido com Django, Tailwind CSS e hospedado na Railway.",
            descricao_completa="""Este é meu portfólio pessoal desenvolvido com Django, onde compartilho meus projetos e artigos sobre desenvolvimento.

## 🚀 Funcionalidades
- Sistema de gerenciamento de projetos
- Blog integrado com editor rico
- Interface administrativa personalizada
- Design responsivo com Tailwind CSS
- SEO otimizado
- Internacionalização (PT/EN)
- PWA (Progressive Web App)

## 🛠️ Tecnologias
- **Backend**: Django 5.2.4
- **Frontend**: Tailwind CSS, JavaScript
- **Banco**: PostgreSQL
- **Deploy**: Railway
- **Arquivos estáticos**: WhiteNoise

## 📱 Recursos
- Design responsivo
- Otimização para SEO
- Sistema de cache
- Compressão de imagens
- Sitemap automático""",
            status='concluido',
            destaque=True,
            ativo=True,
            ordem=1
        )
        
        # Adicionar tecnologias
        tech_names = ['Python', 'Django', 'HTML/CSS', 'Tailwind CSS', 'PostgreSQL', 'Railway']
        for tech_name in tech_names:
            tech = Tecnologia.objects.filter(nome=tech_name).first()
            if tech:
                projeto.tecnologias.add(tech)
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Projeto "{projeto.titulo}" criado com sucesso!')
        )

    def create_example_article(self, author):
        """Cria um artigo de exemplo"""
        self.stdout.write('\n=== CRIANDO ARTIGO DE EXEMPLO ===')
        
        if Artigo.objects.filter(titulo="Bem-vindo ao meu blog!").exists():
            self.stdout.write('ℹ️  Artigo de exemplo já existe')
            return
        
        artigo = Artigo.objects.create(
            titulo="Bem-vindo ao meu blog!",
            autor=author,
            conteudo="""# Bem-vindo ao meu blog! 👋

Olá! Este é meu primeiro artigo no blog. Aqui vou compartilhar experiências, aprendizados e projetos relacionados ao desenvolvimento de software.

## 🚀 O que você vai encontrar aqui

### Projetos e Experiências
- Detalhes sobre projetos que desenvolvi
- Desafios enfrentados e soluções encontradas
- Tecnologias utilizadas e lições aprendidas

### Tutoriais e Dicas
- Guias práticos de desenvolvimento
- Melhores práticas de programação
- Configurações e setups úteis

### Tecnologia e Inovação
- Novidades no mundo da tecnologia
- Análises de ferramentas e frameworks
- Tendências em desenvolvimento

## 💡 Minha Jornada

Sou desenvolvedor apaixonado por tecnologia, sempre em busca de aprender algo novo e compartilhar conhecimento com a comunidade.

### Tecnologias que uso:
- **Backend**: Python, Django, FastAPI
- **Frontend**: JavaScript, React, Tailwind CSS
- **Banco de Dados**: PostgreSQL, SQLite
- **DevOps**: Docker, Railway, Vercel
- **Ferramentas**: Git, VS Code, Linux

## 🎯 Objetivos do Blog

1. **Compartilhar conhecimento** - Documentar aprendizados e experiências
2. **Conectar com a comunidade** - Trocar ideias com outros desenvolvedores
3. **Crescimento pessoal** - Melhorar habilidades de comunicação e escrita
4. **Ajudar outros** - Contribuir para o aprendizado de outros desenvolvedores

## 📬 Vamos conversar!

Fique à vontade para explorar o blog e os projetos. Se tiver alguma dúvida, sugestão ou quiser trocar uma ideia sobre desenvolvimento, será um prazer conversar!

---

*Este artigo foi criado automaticamente durante a configuração inicial do blog. Novos artigos com conteúdo original serão publicados em breve!*""",
            resumo="Primeiro artigo do blog, apresentando os objetivos, o que você pode esperar encontrar aqui e um pouco sobre minha jornada como desenvolvedor.",
            status='publicado'
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Artigo "{artigo.titulo}" criado com sucesso!')
        )