# 🎨 Guia de Ícones de Tecnologias

## 📋 Tecnologias Disponíveis com Ícones

Este projeto utiliza **Font Awesome 6.5.1** para exibir ícones das tecnologias. Abaixo estão as tecnologias configuradas:

### 💻 Linguagens de Programação

| Tecnologia | Ícone | Classe CSS | Cor |
|------------|-------|------------|-----|
| Python | <i class="fab fa-python"></i> | `fab fa-python` | #3776ab |
| JavaScript | <i class="fab fa-js-square"></i> | `fab fa-js-square` | #f7df1e |
| TypeScript | <i class="fab fa-js-square"></i> | `fab fa-js-square` | #3178c6 |
| Java | <i class="fab fa-java"></i> | `fab fa-java` | #ed8b00 |
| C | <i class="fas fa-code"></i> | `fas fa-code` | #A8B9CC |
| C# | <i class="fas fa-code"></i> | `fas fa-code` | #239120 |
| PHP | <i class="fab fa-php"></i> | `fab fa-php` | #777bb4 |

### 🚀 Frameworks

| Tecnologia | Ícone | Classe CSS | Cor |
|------------|-------|------------|-----|
| Django | <i class="fab fa-python"></i> | `fab fa-python` | #092e20 |
| React | <i class="fab fa-react"></i> | `fab fa-react` | #61dafb |
| Vue.js | <i class="fab fa-vuejs"></i> | `fab fa-vuejs` | #4fc08d |
| Angular | <i class="fab fa-angular"></i> | `fab fa-angular` | #dd0031 |
| Laravel | <i class="fab fa-laravel"></i> | `fab fa-laravel` | #ff2d20 |

### 🎨 Frontend & Styling

| Tecnologia | Ícone | Classe CSS | Cor |
|------------|-------|------------|-----|
| HTML5 | <i class="fab fa-html5"></i> | `fab fa-html5` | #e34f26 |
| CSS3 | <i class="fab fa-css3-alt"></i> | `fab fa-css3-alt` | #1572b6 |
| Bootstrap | <i class="fab fa-bootstrap"></i> | `fab fa-bootstrap` | #7952b3 |
| Tailwind CSS | <i class="fas fa-palette"></i> | `fas fa-palette` | #06b6d4 |
| Sass | <i class="fab fa-sass"></i> | `fab fa-sass` | #cc6699 |

### 🗄️ Bancos de Dados

| Tecnologia | Ícone | Classe CSS | Cor |
|------------|-------|------------|-----|
| PostgreSQL | <i class="fas fa-database"></i> | `fas fa-database` | #336791 |
| MySQL | <i class="fas fa-database"></i> | `fas fa-database` | #4479a1 |
| SQLite | <i class="fas fa-database"></i> | `fas fa-database` | #003b57 |
| MongoDB | <i class="fas fa-leaf"></i> | `fas fa-leaf` | #47a248 |
| Supabase | <i class="fas fa-database"></i> | `fas fa-database` | #3ecf8e |
| Redis | <i class="fas fa-database"></i> | `fas fa-database` | #dc382d |

### 🛠️ Ferramentas & Plataformas

| Tecnologia | Ícone | Classe CSS | Cor |
|------------|-------|------------|-----|
| Git | <i class="fab fa-git-alt"></i> | `fab fa-git-alt` | #f05032 |
| GitHub | <i class="fab fa-github"></i> | `fab fa-github` | #181717 |
| Docker | <i class="fab fa-docker"></i> | `fab fa-docker` | #2496ed |
| AWS | <i class="fab fa-aws"></i> | `fab fa-aws` | #ff9900 |
| Node.js | <i class="fab fa-node-js"></i> | `fab fa-node-js` | #339933 |
| Figma | <i class="fab fa-figma"></i> | `fab fa-figma` | #f24e1e |
| Bubble | <i class="fas fa-circle"></i> | `fas fa-circle` | #007bff |
| n8n | <i class="fas fa-project-diagram"></i> | `fas fa-project-diagram` | #ea4b71 |

## 🔧 Como Usar

### 1. No Template Django

```html
<!-- Exemplo de uso em templates -->
{% for tech in project.tecnologias.all %}
    <span class="badge badge-outline">
        {% if tech.icone %}
            <i class="{{ tech.icone }} mr-1" style="color: {{ tech.cor }}"></i>
        {% endif %}
        {{ tech.nome }}
    </span>
{% endfor %}
```

### 2. Adicionando Nova Tecnologia via Admin

1. Acesse `/admin/portfolio/tecnologia/`
2. Clique em "Adicionar Tecnologia"
3. Preencha os campos:
   - **Nome**: Nome da tecnologia
   - **Categoria**: Escolha a categoria apropriada
   - **Ícone**: Classe CSS do Font Awesome (ex: `fab fa-python`)
   - **Cor**: Cor em hexadecimal (ex: `#3776ab`)

### 3. Comando de Atualização

```bash
# Atualizar todas as tecnologias
python manage.py popular_tecnologias
```

## 📚 Referências de Ícones

- **Font Awesome**: https://fontawesome.com/icons
- **Brands (fab)**: Ícones de marcas e empresas
- **Solid (fas)**: Ícones sólidos genéricos
- **Regular (far)**: Ícones com contorno

## 🎯 Dicas de Uso

1. **Consistência**: Use sempre ícones da mesma família (fab para marcas)
2. **Cores**: Use as cores oficiais das tecnologias para melhor reconhecimento
3. **Fallback**: Sempre tenha um ícone genérico como fallback (`fas fa-code`)
4. **Performance**: Os ícones são carregados via CDN, garantindo performance

## 🔄 Atualizações

Para adicionar novas tecnologias, edite o arquivo:
`portfolio/management/commands/popular_tecnologias.py`

E execute:
```bash
python manage.py popular_tecnologias
```