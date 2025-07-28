# 🚀 Deploy no Railway - Guia Completo

## ✅ Problemas Corrigidos

Este guia documenta as correções feitas para resolver o erro 500 no healthcheck do Railway:

### 🔧 Correções Implementadas

1. **Configuração de Produção Automática**
   - Detecção automática do ambiente Railway via `RAILWAY_ENVIRONMENT`
   - `DEBUG=False` forçado em produção
   - `ALLOWED_HOSTS=['*']` para Railway

2. **Correção do Sitemap**
   - Corrigido filtro no `ArticleSitemap`: `status='publicado'` em vez de `publicado=True`
   - Corrigido campo de ordenação: `data_publicacao` em vez de `data_criacao`

3. **Configuração de Logging**
   - Logging configurado para capturar erros em produção
   - Logs direcionados para console (Railway)

4. **Configuração do Gunicorn**
   - Timeout aumentado para 120s
   - 2 workers configurados
   - Healthcheck timeout aumentado para 300s

## 🔑 Variáveis de Ambiente Necessárias

Configure estas variáveis no Railway:

```env
# Obrigatórias
SECRET_KEY=sua-chave-super-secreta-aqui
DATABASE_URL=postgresql://... (Railway fornece automaticamente)
RAILWAY_ENVIRONMENT=production

# Opcionais
DEBUG=False
DJANGO_LOG_LEVEL=INFO
```

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] Executar `python test_railway.py` localmente
- [ ] Verificar se todas as migrações estão aplicadas
- [ ] Confirmar que `requirements.txt` está atualizado

### No Railway
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Adicionar banco PostgreSQL
- [ ] Fazer deploy

### Após o Deploy
- [ ] Verificar logs no Railway
- [ ] Testar healthcheck
- [ ] Verificar se static files estão sendo servidos
- [ ] Testar funcionalidades principais

## 🐛 Troubleshooting

### Erro 500 no Healthcheck
1. Verificar logs no Railway Dashboard
2. Confirmar que `SECRET_KEY` está definida
3. Verificar se `DATABASE_URL` está configurada
4. Confirmar que migrações foram executadas

### Static Files não Carregam
1. Verificar se `collectstatic` foi executado no build
2. Confirmar configuração do WhiteNoise
3. Verificar `STATIC_ROOT` e `STATIC_URL`

### Banco de Dados
1. Verificar se PostgreSQL está conectado
2. Confirmar que migrações foram aplicadas
3. Verificar `DATABASE_URL` nas variáveis de ambiente

## 📁 Arquivos Importantes

- `railway.json` - Configuração de build e deploy
- `Procfile` - Comando de inicialização
- `requirements.txt` - Dependências Python
- `meu_portfolio/settings.py` - Configurações Django
- `test_railway.py` - Script de teste

## 🔄 Comandos Úteis

```bash
# Testar localmente com configurações de produção
RAILWAY_ENVIRONMENT=production python manage.py runserver

# Executar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Testar configurações
python test_railway.py
```

## 📞 Suporte

Se ainda houver problemas:
1. Verificar logs detalhados no Railway
2. Executar `python test_railway.py` localmente
3. Verificar se todas as variáveis de ambiente estão configuradas
4. Confirmar que o banco PostgreSQL está conectado