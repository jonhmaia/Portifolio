# Deploy no Railway - Guia Completo

## ✅ Arquivos Preparados

Todos os arquivos necessários para o deploy no Railway foram criados:

- ✅ `requirements.txt` - Dependências de produção
- ✅ `Procfile` - Comando para iniciar a aplicação
- ✅ `runtime.txt` - Versão do Python
- ✅ `settings.py` - Configurado para produção
- ✅ `.env` - Variáveis de ambiente locais
- ✅ `.gitignore` - Arquivos ignorados pelo Git

## 🚀 Próximos Passos no Railway

### 1. Criar Conta no Railway
- Acesse: https://railway.app
- Faça login com sua conta GitHub

### 2. Criar Novo Projeto
- Clique em "New Project"
- Selecione "Deploy from GitHub repo"
- Escolha o repositório: `jonhmaia/novo-port`
- Clique em "Deploy Now"

### 3. Configurar Variáveis de Ambiente
No painel do Railway, vá em "Variables" e adicione:

```
SECRET_KEY=sua-chave-secreta-super-segura-aqui
DEBUG=False
ALLOWED_HOST=seu-dominio.railway.app
```

### 4. Adicionar PostgreSQL
- No painel do projeto, clique em "+ New"
- Selecione "Database" → "PostgreSQL"
- O Railway criará automaticamente a variável `DATABASE_URL`

### 5. Executar Migrações
No terminal do Railway (ou localmente com as variáveis de produção):
```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 6. Configurar Domínio
- No painel do serviço, vá em "Settings"
- Em "Domains", clique em "Generate Domain"
- Anote o domínio gerado (ex: `seu-app.railway.app`)
- Atualize a variável `ALLOWED_HOST` com este domínio

## 🔧 Configurações Importantes

### Variáveis de Ambiente Obrigatórias:
- `SECRET_KEY`: Chave secreta do Django
- `DEBUG`: False para produção
- `ALLOWED_HOST`: Domínio do Railway
- `DATABASE_URL`: Criada automaticamente pelo PostgreSQL

### Arquivos de Produção:
- `Procfile`: Define como iniciar a aplicação
- `requirements.txt`: Lista todas as dependências
- `runtime.txt`: Especifica a versão do Python

## 🎯 Checklist Final

- [ ] Repositório GitHub atualizado
- [ ] Projeto criado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] PostgreSQL adicionado
- [ ] Migrações executadas
- [ ] Domínio configurado
- [ ] Site funcionando

## 🐛 Troubleshooting

### Erro de Build:
- Verifique se `requirements.txt` está correto
- Confirme se `runtime.txt` tem a versão correta do Python

### Erro de Deploy:
- Verifique se `Procfile` está correto
- Confirme se todas as variáveis de ambiente estão definidas

### Erro de Database:
- Verifique se PostgreSQL foi adicionado
- Execute as migrações: `python manage.py migrate`

### Erro de Static Files:
- Execute: `python manage.py collectstatic --noinput`
- Verifique se Whitenoise está configurado

### Erro CSRF (403 Forbidden):
- Verifique se `CSRF_TRUSTED_ORIGINS` está configurado no settings.py
- Confirme se o domínio do Railway está incluído nas origens confiáveis
- Exemplo: `https://seu-app.railway.app`

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Railway
2. Confirme se todas as variáveis estão definidas
3. Execute os comandos de migração
4. Verifique se o domínio está correto no `ALLOWED_HOSTS`

---

**Status**: ✅ Projeto preparado e pronto para deploy no Railway!
**Repositório**: https://github.com/jonhmaia/novo-port
**Próximo passo**: Criar projeto no Railway e seguir o guia acima.