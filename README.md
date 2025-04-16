# 🚀 Portfólio Pessoal

Bem-vindo(a) ao meu portfólio pessoal desenvolvido com Django!  
Esse projeto representa minha volta ao código — depois de um tempo trabalhando com ferramentas **low-code/no-code**, resolvi reaprender a stack tradicional e criar uma presença online técnica e personalizada.

---

## 🧰 Tecnologias Utilizadas

- **Python & Django** – back-end web framework
- **Bootstrap 5** – estilização responsiva
- **HTML5 + CSS3 + JavaScript** – base da interface
- **Render** – plataforma de deploy
- **Gunicorn** – servidor WSGI
- **Supabase** – back-end externo via API REST
- **Animate.css** – animações visuais
- **Git & GitHub** – versionamento

---

## 🎯 Objetivos do Projeto

- Consolidar conhecimentos em **Django**
- Criar uma presença online com foco técnico
- Integrar com banco de dados externo (Supabase)
- Mostrar habilidades tanto **full-stack** quanto **no-code/low-code**

---

## ✅ Funcionalidades Implementadas

### 📄 Estrutura
- Página inicial com animações e carrossel de tecnologias
- Página de currículo traduzida
- Página de projetos com dados dinâmicos do Supabase
- Navegação com seleção de idioma por bandeiras (🇧🇷 / 🇺🇸)

### 🌍 Internacionalização
- Suporte a i18n com `{% trans %}` e arquivos `.po/.mo`

### 💡 Página de Projetos
- Cards responsivos com:
  - Nome, descrição, tipo e tecnologias
  - Ícones de tipo (🎓, 💼 etc.)
  - Badges com cores específicas para cada tecnologia
- Integração com Supabase via API REST
- Animações de entrada com `Animate.css`

---

## 🛠️ Próximas Atualizações
- Filtros de projeto, por tecnologias ou tipos de projetos
- Traduções multilíngues completas com campos dinâmicos (`*_en`)
- Formulário de contato funcional com envio por email
- Painel para editar conteúdo no Supabase (CMS/admin simplificado)

---

## 📬 Contato

- **Email:** joaomarcosaraujomaia14@gmail.com  
- **LinkedIn:** [linkedin.com/in/joaomarcosmaia](https://www.linkedin.com/in/joaomarcosmaia)  
- **Site:** *[joaomarcos.dev.br]*

---

> Feito com ❤️ e muitos `git push` & `deploy failed` na jornada de volta ao código.

---


## 📝 Commit: atualização com recursos avançados

### ✨ Novas funcionalidades 13/04/2025
- Campo `tipo` renderizado com badge e ícone por categoria
- Tradução de categorias dinâmicas com dicionário no template
- Sistema de cores vibrantes para cada tecnologia (badges)
- Adição de projetos reais via integração com Supabase


### ✨ Novas funcionalidades 16/04/2025
-Agora temos o Mailer, agente contratado para falar bem de mim


## 🛠️ Atualização 16/04/2025
O painel administrativo foi implementado com Django e integrado ao Supabase via API REST. Agora é possível:

- ✅ Criar projetos integrado ao supabase
- 📝 Editar projetos existentes com formulário pré-preenchido
- ❌ Excluir projetos com confirmação de segurança
- 🔐 Acesso restrito a usuários logados
- 🔔 Toasts visuais com feedback (sucesso e erro) 