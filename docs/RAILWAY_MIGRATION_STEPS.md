# 🚀 Guia de Migração para Railway - Passo a Passo

## ✅ Status Atual

- ✅ Dados criados localmente no SQLite
- ✅ Backup exportado: `dados_essenciais.json`
- ✅ Superusuário criado: `admin` / `admin123`
- ✅ Tecnologias básicas configuradas
- ✅ Projeto e artigo de exemplo criados
- ❌ Conexão local com PostgreSQL da Railway com problemas

## 🎯 Solução: Deploy Direto na Railway

Como a conexão local está com problemas, vamos fazer o deploy direto na Railway e configurar os dados lá.

### Passo 1: Fazer Deploy na Railway

1. **Commit e Push do código atual:**
   ```bash
   git add .
   git commit -m "Adicionar scripts de migração e dados iniciais"
   git push origin main
   ```

2. **A Railway fará o deploy automaticamente**

### Passo 2: Configurar Variáveis de Ambiente na Railway

No painel da Railway, configure:

```bash
# Já configuradas automaticamente:
DATABASE_URL=postgresql://postgres:KYPavdrEdkLEasYAzQCmoASUYaZAjKYV@postgres.railway.internal:5432/railway

# Adicionar manualmente:
SECRET_KEY=82)zgg((qot1s%8ku0p@0e%)-&))gso*zg28m_$gbcdro21f)@
DJANGO_ENV=production
DEBUG=False
```

### Passo 3: Executar Comandos na Railway

No terminal da Railway ou via Railway CLI:

```bash
# 1. Executar migrações
python manage.py migrate

# 2. Configurar dados iniciais
python manage.py setup_initial_data --email admin@portfolio.com --password admin123

# 3. Coletar arquivos estáticos
python manage.py collectstatic --noinput
```

### Passo 4: Verificar se Funcionou

1. **Acessar o site:** `https://seu-projeto.railway.app`
2. **Acessar o admin:** `https://seu-projeto.railway.app/admin/`
3. **Fazer login:** `admin` / `admin123`

## 🔄 Alternativa: Usar Railway CLI

Se você tem o Railway CLI instalado:

```bash
# Conectar ao projeto
railway login
railway link

# Executar comandos remotamente
railway run python manage.py migrate
railway run python manage.py setup_initial_data --email admin@portfolio.com --password admin123
railway run python manage.py collectstatic --noinput
```

## 📊 Importar Dados Existentes (Opcional)

Se você quiser importar os dados que já criamos localmente:

1. **Upload do arquivo de dados:**
   - Faça commit do `dados_essenciais.json`
   - Ou use o Railway CLI para fazer upload

2. **Importar no Railway:**
   ```bash
   railway run python manage.py loaddata dados_essenciais.json
   ```

## 🛠️ Comandos Úteis para Railway

```bash
# Ver logs
railway logs

# Conectar ao banco diretamente
railway connect postgres

# Executar shell Django
railway run python manage.py shell

# Criar superusuário adicional
railway run python manage.py createsuperuser

# Fazer backup dos dados
railway run python manage.py dumpdata > backup_railway.json
```

## 🔍 Verificação Final

Após o deploy, verifique:

1. ✅ Site carregando: `https://seu-projeto.railway.app`
2. ✅ Admin funcionando: `/admin/`
3. ✅ Login com superusuário
4. ✅ Projetos e artigos visíveis
5. ✅ Formulários de criação funcionando

## 🚨 Solução de Problemas

### Se o deploy falhar:

1. **Verificar logs:**
   ```bash
   railway logs
   ```

2. **Verificar variáveis de ambiente:**
   - `DATABASE_URL` deve estar configurada
   - `SECRET_KEY` deve estar configurada

3. **Verificar arquivos:**
   - `requirements.txt` atualizado
   - `Procfile` correto
   - `railway.json` configurado

### Se as migrações falharem:

```bash
# Verificar status das migrações
railway run python manage.py showmigrations

# Aplicar migrações específicas
railway run python manage.py migrate portfolio
railway run python manage.py migrate blog
```

## 📝 Próximos Passos

Após a migração bem-sucedida:

1. **Adicionar seus projetos reais** via admin
2. **Adicionar seus artigos** via admin
3. **Personalizar o conteúdo** (sobre, currículo, etc.)
4. **Configurar domínio personalizado** (se necessário)
5. **Fazer backups regulares**

## 🎉 Resultado Final

Você terá:
- ✅ Portfólio funcionando na Railway
- ✅ Banco PostgreSQL configurado
- ✅ Superusuário para administração
- ✅ Sistema pronto para adicionar conteúdo
- ✅ Sem perda de dados em commits futuros

---

**💡 Dica:** Mantenha sempre um backup dos dados importantes usando `python manage.py dumpdata > backup.json`