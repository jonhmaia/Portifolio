# Documentação do Projeto - Portfólio Pessoal

## 📋 Visão Geral
Portfólio pessoal desenvolvido em Django com suporte a internacionalização (i18n), tema escuro/claro e design responsivo usando Tailwind CSS.

## 🏗️ Estrutura do Projeto

### Apps Django
- **core**: Páginas principais (home, currículo)
- **portfolio**: Gerenciamento de projetos
- **blog**: Sistema de blog/artigos
- **jedi**: App para compilação do Tailwind CSS

### Tecnologias Utilizadas
- **Backend**: Django 5.x
- **Frontend**: Tailwind CSS, JavaScript vanilla
- **Internacionalização**: Django i18n (pt-br, en)
- **Banco de Dados**: SQLite
- **Estilização**: Tailwind CSS compilado via Node.js

## ✅ Funcionalidades Implementadas

### 1. Sistema de Internacionalização
- ✅ Configuração para português brasileiro (pt-br) e inglês (en)
- ✅ URLs com prefixo de idioma (`/pt-br/`, `/en/`)
- ✅ Botões de seleção de idioma (desktop e mobile)
- ✅ Traduções básicas implementadas
- ✅ Botão português redireciona para URL raiz (`/`)
- ✅ Botão inglês usa sistema de mudança de idioma do Django

### 2. Interface do Usuário
- ✅ Design responsivo com Tailwind CSS
- ✅ Tema escuro/claro com toggle "lightsaber"
- ✅ Menu mobile hamburger
- ✅ Navegação principal (Home, Currículo, Projetos, Blog)
- ✅ Footer com informações de copyright

### 3. Estrutura de Templates
- ✅ Template base (`base.html`) com layout principal
- ✅ Templates específicos para cada seção
- ✅ Sistema de blocos Django para extensibilidade

### 4. Configurações
- ✅ Configuração de arquivos estáticos
- ✅ Configuração de internacionalização
- ✅ URLs organizadas por app

## 🔄 Próximos Passos

### Prioridade Alta
1. **Conteúdo das Páginas**
   - [ ] Implementar conteúdo da página Home
   - [ ] Criar página de Currículo com informações pessoais
   - [ ] Desenvolver sistema de exibição de projetos
   - [ ] Implementar sistema de blog/artigos

2. **Modelos de Dados**
   - [ ] Criar modelo Project no app portfolio
   - [ ] Criar modelo Article no app blog
   - [ ] Implementar sistema de categorias/tags
   - [ ] Adicionar campos para imagens e descrições

3. **Traduções Completas**
   - [ ] Traduzir todo o conteúdo para inglês
   - [ ] Gerar arquivos .po completos
   - [ ] Compilar traduções finais

### Prioridade Média
4. **Funcionalidades Avançadas**
   - [ ] Sistema de busca no blog
   - [ ] Filtros por categoria/tecnologia
   - [ ] Sistema de comentários (opcional)
   - [ ] Formulário de contato

5. **SEO e Performance**
   - [ ] Meta tags dinâmicas
   - [ ] Sitemap XML
   - [ ] Otimização de imagens
   - [ ] Cache de páginas

6. **Admin Interface**
   - [ ] Configurar Django Admin para projetos
   - [ ] Configurar Django Admin para artigos
   - [ ] Interface amigável para gerenciamento de conteúdo

### Prioridade Baixa
7. **Melhorias de UX**
   - [ ] Animações CSS/JavaScript
   - [ ] Loading states
   - [ ] Breadcrumbs
   - [ ] Scroll to top button

8. **Integrações**
   - [ ] Google Analytics
   - [ ] Integração com redes sociais
   - [ ] Newsletter signup
   - [ ] RSS feed para blog

## 🚀 Sugestões de Melhorias

### 1. Estrutura de Dados
```python
# portfolio/models.py
class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='projects/')
    technologies = models.ManyToManyField('Technology')
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

# blog/models.py
class Article(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    excerpt = models.TextField(max_length=300)
    featured_image = models.ImageField(upload_to='blog/')
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 2. Melhorias de Performance
- Implementar lazy loading para imagens
- Usar CDN para arquivos estáticos
- Implementar cache Redis para produção
- Otimizar queries do banco de dados

### 3. Melhorias de Acessibilidade
- Adicionar atributos ARIA
- Melhorar contraste de cores
- Implementar navegação por teclado
- Adicionar alt text para todas as imagens

### 4. Melhorias de Segurança
- Configurar HTTPS em produção
- Implementar CSP (Content Security Policy)
- Configurar rate limiting
- Validação robusta de formulários

### 5. Deploy e DevOps
- Configurar Docker para desenvolvimento
- Setup de CI/CD com GitHub Actions
- Deploy automatizado (Heroku, DigitalOcean, AWS)
- Monitoramento de erros (Sentry)

## 📁 Estrutura de Arquivos Atual
```
novo port/
├── blog/                 # App do blog
├── core/                 # App principal
├── jedi/                 # App para Tailwind
├── locale/               # Arquivos de tradução
├── meu_portfolio/        # Configurações do projeto
├── portfolio/            # App de projetos
├── static/               # Arquivos estáticos
├── templates/            # Templates HTML
├── manage.py
├── requirements.txt
└── db.sqlite3
```

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Iniciar servidor
python manage.py runserver

# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Gerar traduções
python manage.py makemessages -l en
python manage.py makemessages -l pt-br

# Compilar traduções
python manage.py compilemessages

# Coletar arquivos estáticos
python manage.py collectstatic
```

### Tailwind CSS
```bash
# Entrar na pasta jedi/static_src
cd jedi/static_src

# Instalar dependências
npm install

# Compilar CSS (desenvolvimento)
npm run dev

# Compilar CSS (produção)
npm run build
```

## 📝 Notas Importantes
- O projeto usa `pt-br` como idioma padrão
- URLs com i18n requerem prefixo de idioma
- Tema escuro/claro é salvo no localStorage
- Tailwind CSS precisa ser recompilado após mudanças

---

**Última atualização**: 20/07/2025
**Status**: Em desenvolvimento ativo