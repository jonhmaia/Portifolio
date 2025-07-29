#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meu_portfolio.settings')
django.setup()

from portfolio.models import Projeto, Tecnologia
from django.utils import timezone

def criar_tecnologias_basicas():
    """Cria tecnologias básicas se não existirem"""
    tecnologias = [
        {'nome': 'Python', 'icone': 'fab fa-python', 'cor': '#3776ab', 'categoria': 'linguagem'},
        {'nome': 'JavaScript', 'icone': 'fab fa-js-square', 'cor': '#f7df1e', 'categoria': 'linguagem'},
        {'nome': 'React', 'icone': 'fab fa-react', 'cor': '#61dafb', 'categoria': 'framework'},
        {'nome': 'Django', 'icone': 'fas fa-server', 'cor': '#092e20', 'categoria': 'framework'},
        {'nome': 'Node.js', 'icone': 'fab fa-node-js', 'cor': '#339933', 'categoria': 'framework'},
        {'nome': 'PostgreSQL', 'icone': 'fas fa-database', 'cor': '#336791', 'categoria': 'banco'},
        {'nome': 'MongoDB', 'icone': 'fas fa-leaf', 'cor': '#47a248', 'categoria': 'banco'},
        {'nome': 'HTML/CSS', 'icone': 'fab fa-html5', 'cor': '#e34f26', 'categoria': 'linguagem'},
        {'nome': 'Vue.js', 'icone': 'fab fa-vuejs', 'cor': '#4fc08d', 'categoria': 'framework'},
        {'nome': 'Express.js', 'icone': 'fas fa-server', 'cor': '#000000', 'categoria': 'framework'},
        {'nome': 'TypeScript', 'icone': 'fas fa-code', 'cor': '#3178c6', 'categoria': 'linguagem'},
        {'nome': 'Docker', 'icone': 'fab fa-docker', 'cor': '#2496ed', 'categoria': 'ferramenta'},
        {'nome': 'AWS', 'icone': 'fab fa-aws', 'cor': '#ff9900', 'categoria': 'ferramenta'},
        {'nome': 'Git', 'icone': 'fab fa-git-alt', 'cor': '#f05032', 'categoria': 'ferramenta'},
        {'nome': 'Redis', 'icone': 'fas fa-database', 'cor': '#dc382d', 'categoria': 'banco'},
    ]
    
    for tech_data in tecnologias:
        tech, created = Tecnologia.objects.get_or_create(
            nome=tech_data['nome'],
            defaults=tech_data
        )
        if created:
            print(f"✓ Tecnologia criada: {tech.nome}")

def criar_projetos_ficticios():
    """Cria 10 projetos fictícios"""
    
    # Buscar tecnologias
    python = Tecnologia.objects.get(nome='Python')
    javascript = Tecnologia.objects.get(nome='JavaScript')
    react = Tecnologia.objects.get(nome='React')
    django = Tecnologia.objects.get(nome='Django')
    nodejs = Tecnologia.objects.get(nome='Node.js')
    postgresql = Tecnologia.objects.get(nome='PostgreSQL')
    mongodb = Tecnologia.objects.get(nome='MongoDB')
    html_css = Tecnologia.objects.get(nome='HTML/CSS')
    vue = Tecnologia.objects.get(nome='Vue.js')
    express = Tecnologia.objects.get(nome='Express.js')
    typescript = Tecnologia.objects.get(nome='TypeScript')
    docker = Tecnologia.objects.get(nome='Docker')
    aws = Tecnologia.objects.get(nome='AWS')
    git = Tecnologia.objects.get(nome='Git')
    redis = Tecnologia.objects.get(nome='Redis')
    
    projetos_data = [
        # PROJETOS EM DESTAQUE (5)
        {
            'titulo': 'Sistema de Gestão Empresarial',
            'subtitulo': 'ERP completo para pequenas e médias empresas',
            'descricao_curta': 'Sistema completo de gestão empresarial com módulos de vendas, estoque, financeiro e relatórios avançados.',
            'descricao_completa': '''Sistema ERP desenvolvido para atender pequenas e médias empresas, oferecendo uma solução completa para gestão de negócios.

## 🚀 Funcionalidades Principais
- Gestão de vendas e clientes
- Controle de estoque em tempo real
- Módulo financeiro completo
- Relatórios e dashboards interativos
- Sistema de usuários e permissões
- API REST para integrações

## 🛠️ Tecnologias
- Backend: Django + Django REST Framework
- Frontend: React + TypeScript
- Banco de dados: PostgreSQL
- Cache: Redis
- Deploy: Docker + AWS

## 📊 Resultados
- Redução de 40% no tempo de processos administrativos
- Melhoria de 60% na precisão do controle de estoque
- Interface intuitiva com alta satisfação dos usuários''',
            'tecnologias': [django, python, react, typescript, postgresql, redis, docker, aws],
            'link_repositorio': 'https://github.com/usuario/sistema-gestao-empresarial',
            'link_deploy': 'https://gestao-demo.herokuapp.com',
            'destaque': True,
            'ordem': 1,
            'status': 'concluido'
        },
        {
            'titulo': 'Plataforma de E-learning',
            'subtitulo': 'Ambiente virtual de aprendizagem moderno',
            'descricao_curta': 'Plataforma completa de ensino online com videoaulas, exercícios interativos, fóruns e sistema de avaliação.',
            'descricao_completa': '''Plataforma de e-learning desenvolvida para instituições de ensino e empresas que desejam oferecer treinamentos online.

## 🎓 Recursos Educacionais
- Videoaulas com player customizado
- Exercícios interativos e quizzes
- Fóruns de discussão por disciplina
- Sistema de notas e certificados
- Gamificação com pontos e badges
- Relatórios de progresso detalhados

## 💻 Tecnologias Utilizadas
- Frontend: Vue.js + Nuxt.js
- Backend: Node.js + Express
- Banco: MongoDB
- Streaming: AWS CloudFront
- Autenticação: JWT

## 📈 Impacto
- Mais de 5.000 alunos ativos
- Taxa de conclusão de cursos: 85%
- Avaliação média: 4.8/5 estrelas''',
            'tecnologias': [vue, nodejs, express, mongodb, javascript, aws, docker],
            'link_repositorio': 'https://github.com/usuario/plataforma-elearning',
            'link_deploy': 'https://elearning-demo.vercel.app',
            'destaque': True,
            'ordem': 2,
            'status': 'concluido'
        },
        {
            'titulo': 'App de Delivery Inteligente',
            'subtitulo': 'Aplicativo de entrega com IA para otimização de rotas',
            'descricao_curta': 'Aplicativo mobile de delivery com inteligência artificial para otimização de rotas e previsão de demanda.',
            'descricao_completa': '''Aplicativo revolucionário de delivery que utiliza inteligência artificial para otimizar entregas e melhorar a experiência do usuário.

## 🤖 Inteligência Artificial
- Algoritmo de otimização de rotas em tempo real
- Previsão de demanda por região e horário
- Recomendações personalizadas para usuários
- Análise preditiva de tempo de entrega
- Chatbot para atendimento automatizado

## 📱 Funcionalidades
- Interface intuitiva e responsiva
- Rastreamento em tempo real
- Múltiplas formas de pagamento
- Sistema de avaliações
- Programa de fidelidade
- Notificações push inteligentes

## ⚡ Performance
- Redução de 30% no tempo médio de entrega
- Aumento de 45% na satisfação do cliente
- Economia de 25% em combustível para entregadores''',
            'tecnologias': [react, nodejs, mongodb, python, docker, aws, git],
            'link_repositorio': 'https://github.com/usuario/delivery-inteligente',
            'link_deploy': 'https://delivery-app-demo.netlify.app',
            'destaque': True,
            'ordem': 3,
            'status': 'concluido'
        },
        {
            'titulo': 'Dashboard Analytics Avançado',
            'subtitulo': 'Painel de controle com visualizações interativas',
            'descricao_curta': 'Dashboard completo para análise de dados empresariais com gráficos interativos e relatórios em tempo real.',
            'descricao_completa': '''Dashboard profissional para análise de dados empresariais, oferecendo insights valiosos através de visualizações interativas e relatórios automatizados.

## 📊 Visualizações
- Gráficos interativos com D3.js
- Mapas de calor e geolocalização
- Métricas em tempo real
- Comparativos históricos
- Filtros dinâmicos avançados
- Exportação para PDF/Excel

## 🔧 Funcionalidades Técnicas
- Processamento de big data
- APIs RESTful para integração
- Cache inteligente para performance
- Responsivo para todos os dispositivos
- Temas claro e escuro
- Alertas automáticos por email

## 🎯 Benefícios
- Tomada de decisão baseada em dados
- Identificação de tendências e padrões
- Monitoramento de KPIs em tempo real
- Redução de 50% no tempo de análise''',
            'tecnologias': [react, typescript, nodejs, postgresql, redis, docker],
            'link_repositorio': 'https://github.com/usuario/dashboard-analytics',
            'link_deploy': 'https://analytics-dashboard-demo.vercel.app',
            'destaque': True,
            'ordem': 4,
            'status': 'concluido'
        },
        {
            'titulo': 'API de Microserviços Financeiros',
            'subtitulo': 'Arquitetura de microserviços para fintech',
            'descricao_curta': 'API robusta em microserviços para operações financeiras com alta disponibilidade e segurança bancária.',
            'descricao_completa': '''API de microserviços desenvolvida para operações financeiras, seguindo os mais altos padrões de segurança e disponibilidade do setor bancário.

## 🏦 Serviços Financeiros
- Processamento de pagamentos
- Transferências entre contas
- Gestão de cartões de crédito
- Análise de crédito automatizada
- Compliance e auditoria
- Prevenção à fraude com ML

## 🔒 Segurança
- Criptografia end-to-end
- Autenticação multifator
- Tokens JWT com refresh
- Rate limiting avançado
- Logs de auditoria completos
- Certificação PCI DSS

## ⚡ Performance
- 99.9% de uptime
- Latência média < 100ms
- Processamento de 10k+ transações/segundo
- Auto-scaling baseado em demanda
- Monitoramento 24/7''',
            'tecnologias': [nodejs, typescript, postgresql, redis, docker, aws],
            'link_repositorio': 'https://github.com/usuario/microservicos-financeiros',
            'link_deploy': 'https://api-financeira-docs.herokuapp.com',
            'destaque': True,
            'ordem': 5,
            'status': 'concluido'
        },
        
        # PROJETOS SEM DESTAQUE (5)
        {
            'titulo': 'Blog Pessoal com CMS',
            'subtitulo': 'Sistema de blog com painel administrativo',
            'descricao_curta': 'Blog pessoal desenvolvido com sistema de gerenciamento de conteúdo, comentários e SEO otimizado.',
            'descricao_completa': '''Blog pessoal completo com sistema de gerenciamento de conteúdo próprio, focado em performance e SEO.

## ✍️ Funcionalidades
- Editor de texto rico (WYSIWYG)
- Sistema de categorias e tags
- Comentários com moderação
- Newsletter integrada
- Busca avançada
- Sitemap automático

## 🚀 Otimizações
- SEO on-page completo
- Lazy loading de imagens
- Compressão automática
- Cache de páginas
- PWA (Progressive Web App)
- Core Web Vitals otimizados''',
            'tecnologias': [django, python, html_css, javascript, postgresql],
            'link_repositorio': 'https://github.com/usuario/blog-cms',
            'link_deploy': 'https://meu-blog-demo.herokuapp.com',
            'destaque': False,
            'ordem': 6,
            'status': 'concluido'
        },
        {
            'titulo': 'Calculadora de Investimentos',
            'subtitulo': 'Ferramenta para simulação de investimentos',
            'descricao_curta': 'Aplicação web para cálculo e simulação de diferentes tipos de investimentos com gráficos comparativos.',
            'descricao_completa': '''Ferramenta completa para simulação e comparação de investimentos, ajudando usuários a tomar decisões financeiras informadas.

## 💰 Tipos de Investimento
- Poupança e CDB
- Tesouro Direto
- Fundos de investimento
- Ações e dividendos
- Criptomoedas
- Investimentos internacionais

## 📈 Recursos
- Simulações com juros compostos
- Comparação entre investimentos
- Gráficos interativos
- Histórico de rentabilidade
- Calculadora de IR
- Alertas de vencimento''',
            'tecnologias': [react, javascript, html_css, nodejs],
            'link_repositorio': 'https://github.com/usuario/calculadora-investimentos',
            'link_deploy': 'https://calc-investimentos.netlify.app',
            'destaque': False,
            'ordem': 7,
            'status': 'concluido'
        },
        {
            'titulo': 'Sistema de Biblioteca Digital',
            'subtitulo': 'Gerenciamento de acervo e empréstimos',
            'descricao_curta': 'Sistema completo para gestão de biblioteca com controle de acervo, empréstimos e reservas online.',
            'descricao_completa': '''Sistema de gestão bibliotecária moderno, digitalizando processos e melhorando a experiência dos usuários.

## 📚 Gestão de Acervo
- Catalogação automática
- Busca avançada por múltiplos critérios
- Controle de exemplares
- Histórico de movimentação
- Relatórios de popularidade
- Integração com APIs de livros

## 👥 Funcionalidades do Usuário
- Reservas online
- Renovação automática
- Histórico de empréstimos
- Lista de desejos
- Recomendações personalizadas
- Notificações por email/SMS''',
            'tecnologias': [django, python, postgresql, html_css, javascript],
            'link_repositorio': 'https://github.com/usuario/biblioteca-digital',
            'link_deploy': 'https://biblioteca-demo.railway.app',
            'destaque': False,
            'ordem': 8,
            'status': 'desenvolvimento'
        },
        {
            'titulo': 'App de Controle de Gastos',
            'subtitulo': 'Gerenciador financeiro pessoal',
            'descricao_curta': 'Aplicativo para controle de gastos pessoais com categorização automática e relatórios detalhados.',
            'descricao_completa': '''Aplicativo de controle financeiro pessoal que ajuda usuários a organizarem suas finanças e atingirem seus objetivos.

## 💳 Controle Financeiro
- Categorização automática de gastos
- Metas de economia
- Alertas de orçamento
- Sincronização bancária
- Múltiplas contas e cartões
- Planejamento de aposentadoria

## 📊 Relatórios
- Gráficos de gastos por categoria
- Comparativos mensais
- Projeções futuras
- Análise de padrões
- Exportação de dados
- Backup automático''',
            'tecnologias': [react, nodejs, mongodb, javascript],
            'link_repositorio': 'https://github.com/usuario/controle-gastos',
            'link_deploy': 'https://gastos-app.vercel.app',
            'destaque': False,
            'ordem': 9,
            'status': 'concluido'
        },
        {
            'titulo': 'Portal de Notícias Tech',
            'subtitulo': 'Agregador de notícias de tecnologia',
            'descricao_curta': 'Portal de notícias focado em tecnologia com sistema de curadoria automática e personalização de conteúdo.',
            'descricao_completa': '''Portal de notícias especializado em tecnologia, oferecendo conteúdo curado e personalizado para profissionais da área.

## 📰 Curadoria de Conteúdo
- Agregação automática de fontes
- Classificação por relevância
- Detecção de trending topics
- Filtros por tecnologia
- Sistema de tags inteligente
- Prevenção de fake news

## 🎯 Personalização
- Feed personalizado por interesse
- Notificações push seletivas
- Bookmarks e listas de leitura
- Compartilhamento social
- Comentários da comunidade
- Newsletter semanal''',
            'tecnologias': [vue, nodejs, mongodb, javascript, docker],
            'link_repositorio': 'https://github.com/usuario/portal-noticias-tech',
            'link_deploy': 'https://tech-news-portal.netlify.app',
            'destaque': False,
            'ordem': 10,
            'status': 'desenvolvimento'
        }
    ]
    
    created_count = 0
    
    for projeto_data in projetos_data:
        # Verificar se o projeto já existe
        if not Projeto.objects.filter(titulo=projeto_data['titulo']).exists():
            # Extrair tecnologias
            tecnologias = projeto_data.pop('tecnologias')
            
            # Criar o projeto
            projeto = Projeto.objects.create(**projeto_data)
            
            # Adicionar tecnologias
            projeto.tecnologias.set(tecnologias)
            
            created_count += 1
            status_icon = "⭐" if projeto.destaque else "📁"
            print(f'{status_icon} Projeto criado: {projeto.titulo}')
        else:
            print(f'⚠️  Projeto já existe: {projeto_data["titulo"]}')
    
    print(f'\n🎉 Processo concluído!')
    print(f'📦 {created_count} projetos criados')
    print(f'⭐ 5 projetos em destaque')
    print(f'📁 5 projetos regulares')
    print(f'🔗 Acesse: http://127.0.0.1:8000/portfolio/projects/')

if __name__ == '__main__':
    print('🚀 Criando projetos fictícios...')
    print('\n=== CRIANDO TECNOLOGIAS BÁSICAS ===')
    criar_tecnologias_basicas()
    
    print('\n=== CRIANDO PROJETOS FICTÍCIOS ===')
    criar_projetos_ficticios()
    
    print('\n✅ Script executado com sucesso!')