# 🚀 Portfólio Pessoal - João Marcos

> Portfólio profissional desenvolvido em Django com sistema de internacionalização, gerenciamento de projetos e blog integrado.

## 📋 Visão Geral

Este é um portfólio pessoal profissional desenvolvido em Django 5.2.4 com arquitetura modular, suporte completo a internacionalização (i18n), sistema administrativo avançado e design responsivo usando Tailwind CSS com DaisyUI.

## 🏗️ Arquitetura do Projeto

### 📁 Estrutura de Diretórios

```
meu_portfolio/
├── 📂 blog/                    # App de blog/artigos
├── 📂 core/                    # App principal (home, currículo)
├── 📂 portfolio/               # App de gerenciamento de projetos
├── 📂 jedi/                    # App para compilação Tailwind CSS
├── 📂 locale/                  # Arquivos de tradução
├── 📂 static/                  # Arquivos estáticos
├── 📂 templates/               # Templates HTML
├── 📂 meu_portfolio/           # Configurações Django
├── 📄 manage.py               # Script de gerenciamento Django
├── 📄 requirements.txt        # Dependências Python
└── 📄 README.md              # Esta documentação
```

### 🔧 Apps Django

#### 🏠 **Core App**
- **Função**: Páginas principais do site
- **Views**: Home, Currículo, Login
- **Features**: Contexto dinâmico, views estáticas

#### 💼 **Portfolio App**
- **Função**: Sistema completo de gerenciamento de projetos
- **Models**: Projeto, Tecnologia, ImagemProjeto
- **Features**: Sistema de destaque, ordenação, galeria de imagens

#### 📝 **Blog App**
- **Função**: Sistema de blog/artigos
- **Models**: Artigo
- **Features**: Status rascunho/publicado, slug automático

#### 🎨 **Jedi App**
- **Função**: Compilação e gerenciamento do Tailwind CSS
- **Features**: PostCSS, watch mode, scripts npm

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Django 5.2.4
- **Linguagem**: Python 3.11+
- **Banco de Dados**: SQLite (dev) / PostgreSQL (prod)
- **Deploy**: Railway com Gunicorn + WhiteNoise

### Frontend
- **CSS Framework**: Tailwind CSS 4.x
- **Componentes**: DaisyUI 5.x
- **JavaScript**: Vanilla JS
- **Build Tool**: PostCSS + Node.js

### Internacionalização
- **Idiomas**: Português (pt-br) e Inglês (en)
- **Sistema**: Django i18n completo
- **Features**: URLs com prefixo, seletor de idioma

## 🚀 Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd novo\ port
```

### 2. Configuração Python
```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configuração do Banco de Dados
```bash
# Executar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# (Opcional) Criar projetos de exemplo
python manage.py criar_projetos_exemplo
```

### 4. Configuração do Frontend
```bash
# Navegar para o app jedi
cd jedi/static_src

# Instalar dependências Node.js
npm install

# Compilar CSS para desenvolvimento
npm run dev

# Ou compilar para produção
npm run build
```

### 5. Compilar Traduções
```bash
# Compilar arquivos de tradução
python manage.py compilemessages
```

### 6. Executar o Servidor
```bash
python manage.py runserver
```

O site estará disponível em: `http://127.0.0.1:8000/`

## 🔐 Sistema Administrativo

### Acesso
- **URL**: `http://127.0.0.1:8000/admin/`
- **Credenciais**: Use o superusuário criado na instalação

### Funcionalidades

#### 📁 Gerenciamento de Projetos
- **Campos**: Título, Subtítulo, Descrições, Imagens
- **Status**: Em Desenvolvimento, Concluído, Pausado, Arquivado
- **Features**: Sistema de destaque, ordenação, tecnologias
- **Links**: Repositório e Deploy

#### 🏷️ Gerenciamento de Tecnologias
- **Campos**: Nome, Ícone, Cor, Categoria
- **Categorias**: Linguagem, Framework, Biblioteca, Banco, Ferramenta
- **Features**: Ícones FontAwesome, cores personalizadas

#### 📝 Gerenciamento de Artigos
- **Campos**: Título, Conteúdo, Imagem, Status
- **Features**: Slug automático, data de publicação
- **Status**: Rascunho, Publicado

## 🌐 Internacionalização

### Idiomas Suportados
- **Português (pt-br)**: Idioma padrão
- **Inglês (en)**: Tradução completa

### Como Adicionar Traduções
1. Marcar strings nos templates com `{% trans "texto" %}`
2. Executar: `python manage.py makemessages -l en`
3. Editar arquivo: `locale/en/LC_MESSAGES/django.po`
4. Compilar: `python manage.py compilemessages`

### Seletor de Idioma
- Disponível no cabeçalho do site
- URLs automáticas com prefixo (`/pt-br/`, `/en/`)
- Persistência via sessão

## 📱 Design e UX

### Responsividade
- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm, md, lg, xl (Tailwind CSS)
- **Componentes**: Cards, modais, navegação adaptativa

### Temas
- **Tema Principal**: Design moderno com gradientes
- **Cores**: Paleta profissional azul/roxo
- **Efeitos**: Hover, animações CSS, transições

### Acessibilidade
- Contraste adequado
- Navegação por teclado
- Textos alternativos em imagens
- Estrutura semântica HTML5

## 🔧 Comandos Úteis

### Django
```bash
# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic

# Criar projetos de exemplo
python manage.py criar_projetos_exemplo

# Compilar traduções
python manage.py compilemessages
```

### Frontend (Tailwind)
```bash
cd jedi/static_src

# Desenvolvimento (watch mode)
npm run dev

# Produção (minificado)
npm run build

# Instalar dependências
npm install
```

## 🚀 Deploy

### Railway (Recomendado)
1. Conectar repositório GitHub
2. Configurar variáveis de ambiente:
   - `SECRET_KEY`
   - `DEBUG=False`
   - `DATABASE_URL` (PostgreSQL)
3. Deploy automático via Git

### Variáveis de Ambiente
```env
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=False
DATABASE_URL=postgresql://...
ALLOWED_HOST=seu-dominio.railway.app
```

## 📊 Funcionalidades Implementadas

### ✅ Concluído
- [x] Sistema de internacionalização completo
- [x] Gerenciamento de projetos com admin
- [x] Sistema de blog básico
- [x] Design responsivo Tailwind + DaisyUI
- [x] Compilação CSS automatizada
- [x] Deploy Railway configurado
- [x] Sistema de tecnologias com ícones
- [x] Galeria de imagens para projetos
- [x] Template tags personalizadas
- [x] Middleware de localização

### 🔄 Em Desenvolvimento
- [ ] Sistema de busca
- [ ] Paginação nas listagens
- [ ] Formulário de contato
- [ ] Otimização SEO
- [ ] Sistema de comentários
- [ ] Newsletter

### 🎯 Próximos Passos
- [ ] Testes automatizados
- [ ] Cache system (Redis)
- [ ] Compressão de imagens
- [ ] Monitoramento e analytics
- [ ] PWA (Progressive Web App)
- [ ] API REST para mobile

## 🛡️ Segurança

### Medidas Implementadas
- Autenticação obrigatória para admin
- CSRF protection ativo
- Validação de dados de entrada
- Configurações seguras para produção
- Variáveis de ambiente protegidas
- CORS configurado adequadamente

## 🧪 Testes

### Executar Testes
```bash
# Todos os testes
python manage.py test

# Testes específicos
python manage.py test portfolio
python manage.py test blog
python manage.py test core
```

## 📈 Performance

### Otimizações
- WhiteNoise para arquivos estáticos
- Compressão CSS/JS em produção
- Lazy loading de imagens
- Queries otimizadas no admin
- Cache de templates

## 🤝 Contribuição

### Como Contribuir
1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

### Padrões de Código
- PEP 8 para Python
- Prettier para JavaScript/CSS
- Comentários em português
- Commits em português

## 📞 Contato

- **Desenvolvedor**: João Marcos
- **Email**: joaomaia@discente.ufg.br
- **LinkedIn**: [Seu LinkedIn]
- **GitHub**: [Seu GitHub]

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**💡 Dica**: Use o campo "Ordem" no admin para controlar exatamente como os projetos aparecem no site. Números menores aparecem primeiro (0 = primeiro lugar).

**🎯 Status do Projeto**: ✅ Funcional e pronto para produção!