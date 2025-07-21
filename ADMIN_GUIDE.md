# 📋 Guia do Sistema Administrativo - Portfólio

## 🔐 Acesso ao Painel Administrativo

### URL de Acesso
```
http://127.0.0.1:8000/admin/
```

### Credenciais do Superusuário
- **Usuário:** jm
- **Email:** joaomaia@discente.ufg.br
- **Senha:** Maia1@J12

## 🎯 Funcionalidades Principais

### 1. 📁 Gerenciamento de Projetos

#### Campos Disponíveis:
- **Título:** Nome principal do projeto
- **Subtítulo:** Descrição complementar (opcional)
- **Descrição Curta:** Resumo de até 300 caracteres
- **Descrição Completa:** Descrição detalhada do projeto
- **Imagem Principal:** Imagem de destaque do projeto
- **Tecnologias:** Seleção múltipla das tecnologias utilizadas
- **Links:** Repositório GitHub e deploy/demo
- **Status:** Em Desenvolvimento, Concluído, Pausado, Arquivado
- **Destaque:** Marcar para exibir na página inicial
- **Ordem:** Controle da ordem de exibição
- **Ativo:** Controle de visibilidade no site

#### Funcionalidades CRUD:
- ✅ **Criar:** Adicionar novos projetos
- 📖 **Ler:** Visualizar lista e detalhes dos projetos
- ✏️ **Editar:** Modificar informações dos projetos
- 🗑️ **Excluir:** Remover projetos do sistema

#### Ações em Lote:
- Marcar/remover projetos como destaque
- Ativar/desativar múltiplos projetos
- Filtros por status, tecnologias, datas

### 2. 🛠️ Gerenciamento de Tecnologias

#### Campos Disponíveis:
- **Nome:** Nome da tecnologia
- **Categoria:** Linguagem, Framework, Biblioteca, Banco, Ferramenta, Outros
- **Ícone:** Classe CSS do ícone (ex: fab fa-python)
- **Cor:** Cor em hexadecimal para identificação visual
- **Ativo:** Controle de disponibilidade

#### Tecnologias Pré-cadastradas:
- **Linguagens:** Python, JavaScript, TypeScript, Java, C#, PHP, Go, Rust
- **Frameworks:** Django, Flask, React, Vue.js, Angular, Next.js, Express.js, Laravel, Spring Boot
- **Bibliotecas:** Bootstrap, Tailwind CSS, jQuery, Pandas, NumPy, TensorFlow
- **Bancos:** PostgreSQL, MySQL, SQLite, MongoDB, Redis
- **Ferramentas:** Git, GitHub, Docker, AWS, Heroku, Railway, VS Code, Figma
- **Outros:** HTML5, CSS3, Sass, Node.js, API REST, GraphQL

### 3. 🖼️ Gerenciamento de Imagens

#### Galeria de Imagens por Projeto:
- Upload de múltiplas imagens por projeto
- Legendas personalizadas
- Controle de ordem de exibição
- Ativação/desativação individual

## 🎨 Interface Administrativa

### Características:
- **Design Intuitivo:** Interface limpa e organizada
- **Badges Visuais:** Status coloridos para fácil identificação
- **Preview de Imagens:** Visualização rápida das imagens
- **Filtros Avançados:** Busca por múltiplos critérios
- **Edição Inline:** Modificação rápida de campos específicos

### Organização por Seções:
1. **Informações Básicas:** Dados principais do projeto
2. **Descrições:** Textos explicativos
3. **Mídia:** Imagens e arquivos
4. **Tecnologias:** Seleção de tecnologias utilizadas
5. **Links:** URLs de repositório e deploy
6. **Configurações de Exibição:** Controles de visibilidade
7. **Datas:** Cronologia do projeto

## 🚀 Fluxo de Trabalho Recomendado

### Para Criar um Novo Projeto:
1. Acesse **Projetos** → **Adicionar projeto**
2. Preencha as **Informações Básicas**
3. Adicione **Descrições** detalhadas
4. Faça upload da **Imagem Principal**
5. Selecione as **Tecnologias** utilizadas
6. Adicione **Links** do repositório e deploy
7. Configure **Status** e **Visibilidade**
8. Defina **Ordem** de exibição
9. Marque como **Destaque** se necessário
10. **Salve** o projeto

### Para Gerenciar Destaques:
1. Na lista de projetos, use os filtros para encontrar projetos
2. Selecione os projetos desejados
3. Use as ações em lote:
   - "Marcar projetos selecionados como destaque"
   - "Remover destaque dos projetos selecionados"

### Para Adicionar Novas Tecnologias:
1. Acesse **Tecnologias** → **Adicionar tecnologia**
2. Defina **Nome** e **Categoria**
3. Configure **Ícone** (classe CSS)
4. Escolha uma **Cor** representativa
5. **Salve** a tecnologia

## 🔧 Comandos Úteis

### Popular Tecnologias Padrão:
```bash
python manage.py popular_tecnologias
```

### Criar Superusuário:
```bash
python manage.py createsuperuser
```

### Aplicar Migrações:
```bash
python manage.py migrate
```

## 📊 Recursos Avançados

### Filtros Disponíveis:
- **Por Status:** Desenvolvimento, Concluído, Pausado, Arquivado
- **Por Destaque:** Projetos em destaque ou não
- **Por Tecnologia:** Filtrar por tecnologias específicas
- **Por Data:** Período de criação ou conclusão
- **Por Atividade:** Projetos ativos ou inativos

### Busca Inteligente:
- Busca em títulos, subtítulos e descrições
- Busca por tecnologias utilizadas
- Busca em legendas de imagens

### Ordenação Automática:
- Projetos em destaque aparecem primeiro
- Ordenação por campo "ordem" personalizada
- Projetos mais recentes por último

## 🛡️ Segurança

- Acesso restrito a superusuários
- Autenticação obrigatória
- Logs de atividades administrativas
- Validação de dados de entrada

## 📱 Responsividade

O painel administrativo é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Tablets
- 📱 Smartphones

---

**💡 Dica:** Use o campo "Ordem" para controlar exatamente como os projetos aparecem no site. Números menores aparecem primeiro (0 = primeiro lugar).